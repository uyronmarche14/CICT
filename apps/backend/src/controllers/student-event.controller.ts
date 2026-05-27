import { Response } from 'express';
import Event from '../models/Event';
import EventRegistration from '../models/EventRegistration';
import EventAttendanceLog from '../models/EventAttendanceLog';
import Student from '../models/Student';
import { AppError } from '../middleware/errorHandler';
import { isFeatureEnabled } from '../utils/features';
import { StudentAuthRequest } from '../middleware/studentAuth';
import { EventRegistrationStatus, IEventRegistration } from '../types';
import {
  createQrNonce,
  buildQrToken,
  isStudentEligibleForEvent,
  ensureEventOpenForRegistration,
  logStudentActivity,
  reserveCapacity,
  releaseCapacity,
  checkRegistrationDuplicate,
} from '../services/event-registration.service';

export const getStudentEvents = async (req: StudentAuthRequest, res: Response): Promise<void> => {
  if (!req.student) {
    throw new AppError('Student not authenticated', 401);
  }

  const events = await Event.find({
    status: 'published',
    endDate: { $gte: new Date() },
  }).sort({ startDate: 1 });

  const eligibleEvents = events.filter((event) => isStudentEligibleForEvent(event, req.student!));
  const registrations = await EventRegistration.find({
    studentId: req.student.studentId,
    eventId: { $in: eligibleEvents.map((event) => event._id) },
  });

  const registrationMap = new Map(
    registrations.map((registration) => [String(registration.eventId), registration])
  );

  res.status(200).json({
    success: true,
    data: {
      events: eligibleEvents.map((event) => ({
        ...event.toObject(),
        registration: registrationMap.get(String(event._id)) ?? null,
      })),
    },
  });
};

export const registerForEvent = async (
  req: StudentAuthRequest,
  res: Response
): Promise<void> => {
  if (!req.student) {
    throw new AppError('Student not authenticated', 401);
  }

  const registrationEnabled = await isFeatureEnabled('selfRegistration');
  if (!registrationEnabled) {
    throw new AppError('Student self-registration is currently disabled', 403);
  }

  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  ensureEventOpenForRegistration(event);

  const student = await Student.findById(req.student.studentId);
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  if (!isStudentEligibleForEvent(event, student)) {
    throw new AppError('Student is not eligible for this event', 403);
  }

  const isDuplicate = await checkRegistrationDuplicate(event._id, student._id);
  if (isDuplicate) {
    throw new AppError('Student is already registered for this event', 409);
  }

  const capacityOk = await reserveCapacity(String(event._id), event.maxAttendees);
  if (!capacityOk) {
    throw new AppError('Event is already full', 409);
  }

  let registration: IEventRegistration;

  try {
    const cancelledRegistration = await EventRegistration.findOne({
      eventId: event._id,
      studentId: student._id,
      status: EventRegistrationStatus.CANCELLED,
    });

    if (cancelledRegistration) {
      cancelledRegistration.status = EventRegistrationStatus.REGISTERED;
      cancelledRegistration.qrNonce = createQrNonce();
      cancelledRegistration.qrIssuedAt = new Date();
      cancelledRegistration.registeredAt = new Date();
      cancelledRegistration.cancelledAt = undefined;
      cancelledRegistration.checkedInAt = undefined;
      cancelledRegistration.eligibilitySnapshot = {
        programId: String(student.programId),
        yearLevelId: String(student.yearLevelId),
        sectionId: String(student.sectionId),
      };
      cancelledRegistration.source = 'self';
      cancelledRegistration.scanCount = 0;
      await cancelledRegistration.save();
      registration = cancelledRegistration;
    } else {
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
        source: 'self',
      });
    }
  } catch (error: any) {
    await releaseCapacity(String(event._id));
    if (error.code === 11000) {
      throw new AppError('You are already registered for this event', 409);
    }
    throw error;
  }

  logStudentActivity({
    action: 'student_register_event',
    resource: 'event_registration',
    resourceId: String(registration._id),
    studentId: String(student._id),
    eventId: String(event._id),
    outcome: 'success',
  }).catch(() => {});

  res.status(201).json({
    success: true,
    data: { registration },
  });
};

export const cancelEventRegistration = async (
  req: StudentAuthRequest,
  res: Response
): Promise<void> => {
  if (!req.student) {
    throw new AppError('Student not authenticated', 401);
  }

  const registration = await EventRegistration.findOne({
    eventId: req.params.id,
    studentId: req.student.studentId,
    status: { $in: [EventRegistrationStatus.REGISTERED] },
  });

  if (!registration) {
    throw new AppError('Active registration not found', 404);
  }

  registration.status = EventRegistrationStatus.CANCELLED;
  registration.cancelledAt = new Date();
  await registration.save();

  await releaseCapacity(req.params.id);

  await logStudentActivity({
    action: 'student_cancel_event_registration',
    resource: 'event_registration',
    resourceId: String(registration._id),
    studentId: req.student.studentId,
    eventId: req.params.id,
    outcome: 'success',
  });

  res.status(200).json({
    success: true,
    data: { registration },
  });
};

export const getOwnEventRegistration = async (
  req: StudentAuthRequest,
  res: Response
): Promise<void> => {
  if (!req.student) {
    throw new AppError('Student not authenticated', 401);
  }

  const registration = await EventRegistration.findOne({
    eventId: req.params.id,
    studentId: req.student.studentId,
  });

  res.status(200).json({
    success: true,
    data: { registration },
  });
};

export const getStudentRegistrations = async (
  req: StudentAuthRequest,
  res: Response
): Promise<void> => {
  if (!req.student) {
    throw new AppError('Student not authenticated', 401);
  }

  const registrations = await EventRegistration.find({
    studentId: req.student.studentId,
  })
    .populate('eventId', 'title startDate endDate location status')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { registrations },
  });
};

export const getEventQrPayload = async (
  req: StudentAuthRequest,
  res: Response
): Promise<void> => {
  if (!req.student) {
    throw new AppError('Student not authenticated', 401);
  }

  const registration = await EventRegistration.findOne({
    eventId: req.params.id,
    studentId: req.student.studentId,
    status: { $in: [EventRegistrationStatus.REGISTERED, EventRegistrationStatus.CHECKED_IN] },
  });

  if (!registration) {
    throw new AppError('Active registration not found', 404);
  }

  const token = buildQrToken({
    actorType: 'student_qr',
    eventId: req.params.id,
    registrationId: String(registration._id),
    studentId: req.student.studentId,
    studentNumber: req.student.studentNumber,
    qrVersion: req.student.qrVersion,
    qrNonce: registration.qrNonce,
  });

  await logStudentActivity({
    action: 'student_generate_event_qr',
    resource: 'student_qr',
    resourceId: String(registration._id),
    studentId: req.student.studentId,
    eventId: req.params.id,
    outcome: 'success',
  });

  res.status(200).json({
    success: true,
    data: {
      token,
      registrationId: String(registration._id),
    },
  });
};

export const getStudentAttendanceHistory = async (
  req: StudentAuthRequest,
  res: Response
): Promise<void> => {
  if (!req.student) {
    throw new AppError('Student not authenticated', 401);
  }

  const attendanceLogs = await EventAttendanceLog.find({
    studentId: req.student.studentId,
  })
    .populate('eventId', 'title startDate location')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { attendanceLogs },
  });
};
