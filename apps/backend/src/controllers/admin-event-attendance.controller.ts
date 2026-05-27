import { Response } from 'express';
import jwt from 'jsonwebtoken';
import Event from '../models/Event';
import EventRegistration from '../models/EventRegistration';
import EventAttendanceLog from '../models/EventAttendanceLog';
import Student from '../models/Student';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { AttendanceScanResult, EventRegistrationStatus, Permission } from '../types';
import { ensureCanManageOwnedContent } from '../utils/organizationScope';
import { parsePagination } from '../utils/pagination';
import { sanitizeSearchInput } from '../utils/escapeRegex';
import {
  createQrNonce,
  isStudentEligibleForEvent,
  ensureEventOpenForRegistration,
  logAdminAttendanceActivity,
  incrementCheckedInCount,
  reserveCapacity,
  releaseCapacity,
} from '../services/event-registration.service';

const getStudentQrSecret = (): string => {
  const secret = process.env.STUDENT_QR_SECRET;
  if (!secret) {
    throw new Error('STUDENT_QR_SECRET is not configured');
  }
  return secret;
};

export const getEventAttendanceLogs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  await ensureCanManageOwnedContent(
    req.user,
    Permission.VIEW_EVENT_REGISTRATIONS,
    event.ownerType,
    event.organizationId ?? null
  );

  const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>, 50, 100);

  const filter: Record<string, unknown> = { eventId: event._id };

  const resultFilter = req.query.result as string;
  if (resultFilter && resultFilter !== 'all') {
    filter.result = resultFilter;
  }

  const scanType = req.query.scanType as string;
  if (scanType && scanType !== 'all') {
    filter.scanType = scanType;
  }

  const q = (req.query.q as string || '').trim();
  let studentIds: string[] | undefined;

  const safeLogQ = sanitizeSearchInput(q);
  if (safeLogQ && q.length >= 2) {
    const students = await Student.find({
      $or: [
        { firstName: { $regex: safeLogQ, $options: 'i' } },
        { lastName: { $regex: safeLogQ, $options: 'i' } },
        { studentNumber: { $regex: safeLogQ, $options: 'i' } },
      ],
    }).select('_id');
    studentIds = students.map((s) => String(s._id));
    if (studentIds.length === 0) {
      res.status(200).json({
        success: true,
        data: { logs: [], total: 0, page, totalPages: 0 },
      });
      return;
    }
    filter.studentId = { $in: studentIds };
  }

  const [logs, total, byResult, byScanType] = await Promise.all([
    EventAttendanceLog.find(filter)
      .populate('studentId', 'studentNumber firstName lastName')
      .populate('scannedByAdminId', 'firstName lastName')
      .sort({ scannedAt: -1 })
      .skip(skip)
      .limit(limit),
    EventAttendanceLog.countDocuments(filter),
    EventAttendanceLog.aggregate([
      { $match: { eventId: event._id } },
      { $group: { _id: '$result', count: { $sum: 1 } } },
    ]),
    EventAttendanceLog.aggregate([
      { $match: { eventId: event._id } },
      { $group: { _id: '$scanType', count: { $sum: 1 } } },
    ]),
  ]);

  const summary = {
    byResult: Object.fromEntries(byResult.map((r: { _id: string; count: number }) => [r._id, r.count])),
    byScanType: Object.fromEntries(byScanType.map((r: { _id: string; count: number }) => [r._id, r.count])),
  };

  res.status(200).json({
    success: true,
    data: {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      summary,
    },
  });
};

export const exportEventAttendanceLogs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  await ensureCanManageOwnedContent(
    req.user,
    Permission.VIEW_EVENT_REGISTRATIONS,
    event.ownerType,
    event.organizationId ?? null
  );

  const filter: Record<string, unknown> = { eventId: event._id };

  const resultFilter = req.query.result as string;
  if (resultFilter && resultFilter !== 'all') {
    filter.result = resultFilter;
  }

  const scanType = req.query.scanType as string;
  if (scanType && scanType !== 'all') {
    filter.scanType = scanType;
  }

  const q = (req.query.q as string || '').trim();
  const safeExportQ = sanitizeSearchInput(q);
  if (safeExportQ && q.length >= 2) {
    const students = await Student.find({
      $or: [
        { firstName: { $regex: safeExportQ, $options: 'i' } },
        { lastName: { $regex: safeExportQ, $options: 'i' } },
        { studentNumber: { $regex: safeExportQ, $options: 'i' } },
      ],
    }).select('_id');
    const studentIds = students.map((s) => String(s._id));
    if (studentIds.length === 0) {
      res.status(200).json({ success: true, data: { logs: [] } });
      return;
    }
    filter.studentId = { $in: studentIds };
  }

  const logs = await EventAttendanceLog.find(filter)
    .populate('studentId', 'studentNumber firstName lastName')
    .populate('scannedByAdminId', 'firstName lastName')
    .sort({ scannedAt: -1 })
    .limit(10000);

  res.status(200).json({
    success: true,
    data: { logs },
  });
};

export const scanEventAttendance = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  await ensureCanManageOwnedContent(
    req.user,
    Permission.SCAN_EVENT_ATTENDANCE,
    event.ownerType,
    event.organizationId ?? null
  );

  const { qrToken, studentNumber, notes } = req.body as {
    qrToken?: string;
    studentNumber?: string;
    notes?: string;
  };

  let registration: any = null;
  let student: any = null;

  if (qrToken) {
    try {
      const decoded = jwt.verify(qrToken, getStudentQrSecret()) as Record<string, unknown>;
      if (decoded.actorType !== 'student_qr' || decoded.eventId !== req.params.id) {
        throw new Error('QR token does not match event');
      }

      registration = await EventRegistration.findById(String(decoded.registrationId));
      if (!registration) {
        throw new Error('Registration not found');
      }
      student = await Student.findById(String(decoded.studentId));
      if (!student) {
        throw new Error('Student not found');
      }
      if (registration.qrNonce !== decoded.qrNonce) {
        throw new Error('QR nonce mismatch');
      }
      if (student.qrVersion !== decoded.qrVersion) {
        throw new Error('QR version mismatch');
      }
    } catch {
      await EventAttendanceLog.create({
        eventId: event._id,
        scanType: 'entry',
        result: AttendanceScanResult.INVALID_QR,
        scannedByAdminId: req.user?.userId,
        notes,
      });

      await logAdminAttendanceActivity({
        adminUserId: req.user!.userId,
        action: 'scan_event_attendance',
        eventId: req.params.id,
        outcome: 'failure',
        reasonCode: AttendanceScanResult.INVALID_QR,
      });

      res.status(200).json({
        success: true,
        data: { result: AttendanceScanResult.INVALID_QR },
      });
      return;
    }
  } else if (studentNumber) {
    student = await Student.findOne({ studentNumber: studentNumber.trim().toUpperCase() });
    if (!student) {
      res.status(200).json({
        success: true,
        data: { result: AttendanceScanResult.NOT_REGISTERED },
      });
      return;
    }

    registration = await EventRegistration.findOne({
      eventId: event._id,
      studentId: student._id,
      status: { $in: [EventRegistrationStatus.REGISTERED, EventRegistrationStatus.CHECKED_IN] },
    });

    if (!registration && event.allowWalkIns) {
      try {
        ensureEventOpenForRegistration(event);
      } catch {
        res.status(200).json({
          success: true,
          data: { result: AttendanceScanResult.REGISTRATION_CLOSED },
        });
        return;
      }

      if (!isStudentEligibleForEvent(event, student)) {
        res.status(200).json({
          success: true,
          data: { result: AttendanceScanResult.NOT_ELIGIBLE },
        });
        return;
      }

      const capacityOk = await reserveCapacity(String(event._id), event.maxAttendees);
      if (!capacityOk) {
        res.status(200).json({
          success: true,
          data: { result: AttendanceScanResult.EVENT_FULL },
        });
        return;
      }

      try {
        registration = await EventRegistration.create({
          eventId: event._id,
          studentId: student._id,
          status: EventRegistrationStatus.REGISTERED,
          qrNonce: createQrNonce(),
          qrIssuedAt: new Date(),
          registeredAt: new Date(),
          eligibilitySnapshot: {
            programId: String(student.programId),
            yearLevelId: String(student.yearLevelId),
            sectionId: String(student.sectionId),
          },
          source: 'walk_in',
        });
      } catch {
        await releaseCapacity(String(event._id));
        throw new AppError('Failed to create walk-in registration', 500);
      }
    }
  }

  if (!registration || !student) {
    await EventAttendanceLog.create({
      eventId: event._id,
      scanType: qrToken ? 'entry' : 'manual',
      result: AttendanceScanResult.NOT_REGISTERED,
      scannedByAdminId: req.user?.userId,
      notes,
    });

    await logAdminAttendanceActivity({
      adminUserId: req.user!.userId,
      action: 'scan_event_attendance',
      eventId: req.params.id,
      outcome: 'failure',
      reasonCode: AttendanceScanResult.NOT_REGISTERED,
    });

    res.status(200).json({
      success: true,
      data: { result: AttendanceScanResult.NOT_REGISTERED },
    });
    return;
  }

  if (registration.status === EventRegistrationStatus.CANCELLED) {
    res.status(200).json({
      success: true,
      data: { result: AttendanceScanResult.NOT_REGISTERED },
    });
    return;
  }

  if (!isStudentEligibleForEvent(event, student)) {
    res.status(200).json({
      success: true,
      data: { result: AttendanceScanResult.NOT_ELIGIBLE },
    });
    return;
  }

  if (registration.checkedInAt) {
    await EventAttendanceLog.create({
      eventId: event._id,
      registrationId: registration._id,
      studentId: student._id,
      scanType: qrToken ? 'entry' : 'manual',
      result: AttendanceScanResult.DUPLICATE,
      scannedByAdminId: req.user?.userId,
      notes,
    });

    await logAdminAttendanceActivity({
      adminUserId: req.user!.userId,
      action: 'scan_event_attendance',
      eventId: req.params.id,
      resourceId: String(registration._id),
      outcome: 'duplicate',
      studentId: String(student._id),
      reasonCode: AttendanceScanResult.DUPLICATE,
    });

    res.status(200).json({
      success: true,
      data: { result: AttendanceScanResult.DUPLICATE, registration },
    });
    return;
  }

  registration.checkedInAt = new Date();
  registration.scanCount += 1;
  registration.status = EventRegistrationStatus.CHECKED_IN;
  await registration.save();
  await incrementCheckedInCount(req.params.id);

  await EventAttendanceLog.create({
    eventId: event._id,
    registrationId: registration._id,
    studentId: student._id,
    scanType: qrToken ? 'entry' : 'manual',
    result: AttendanceScanResult.SUCCESS,
    scannedByAdminId: req.user?.userId,
    notes,
  });

  await logAdminAttendanceActivity({
    adminUserId: req.user!.userId,
    action: 'scan_event_attendance',
    eventId: req.params.id,
    resourceId: String(registration._id),
    outcome: 'success',
    studentId: String(student._id),
    reasonCode: AttendanceScanResult.SUCCESS,
  });

  res.status(200).json({
    success: true,
    data: { result: AttendanceScanResult.SUCCESS, registration },
  });
};
