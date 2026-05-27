import { Response } from 'express';
import Event from '../models/Event';
import EventRegistration from '../models/EventRegistration';
import Student from '../models/Student';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { EventRegistrationStatus, Permission } from '../types';
import { ensureCanManageOwnedContent } from '../utils/organizationScope';
import { sanitizeSearchInput } from '../utils/escapeRegex';
import {
  createQrNonce,
  isStudentEligibleForEvent,
  logAdminAttendanceActivity,
  releaseCapacity,
} from '../services/event-registration.service';

export const getEventRegistrationsForAdmin = async (
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

  const registrations = await EventRegistration.find({ eventId: event._id })
    .populate('studentId', 'studentNumber firstName lastName email status')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { registrations },
  });
};

export const searchEventRegistrations = async (
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

  const q = (req.query.q as string || '').trim();
  if (!q || q.length < 2) {
    res.status(200).json({ success: true, data: { registrations: [] } });
    return;
  }

  const safeQ = sanitizeSearchInput(q) || '';
  const students = await Student.find({
    $or: [
      { firstName: { $regex: safeQ, $options: 'i' } },
      { lastName: { $regex: safeQ, $options: 'i' } },
      { studentNumber: { $regex: safeQ, $options: 'i' } },
    ],
  }).select('_id');

  const studentIds = students.map((s) => s._id);

  const registrations = await EventRegistration.find({
    eventId: event._id,
    studentId: { $in: studentIds },
  })
    .populate('studentId', 'studentNumber firstName lastName email status')
    .sort({ createdAt: -1 })
    .limit(20);

  res.status(200).json({
    success: true,
    data: { registrations },
  });
};

export const adminCancelRegistration = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id: eventId, regId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  await ensureCanManageOwnedContent(
    req.user,
    Permission.MANAGE_EVENT_REGISTRATIONS,
    event.ownerType,
    event.organizationId ?? null
  );

  const registration = await EventRegistration.findById(regId);
  if (!registration) {
    throw new AppError('Registration not found', 404);
  }

  if (registration.eventId.toString() !== eventId) {
    throw new AppError('Registration does not belong to this event', 400);
  }

  if (registration.status === EventRegistrationStatus.CANCELLED) {
    throw new AppError('Registration is already cancelled', 400);
  }

  const wasCheckedIn = registration.status === EventRegistrationStatus.CHECKED_IN;

  registration.status = EventRegistrationStatus.CANCELLED;
  registration.cancelledAt = new Date();
  await registration.save();

  await releaseCapacity(eventId);

  if (wasCheckedIn) {
    await Event.findOneAndUpdate(
      { _id: eventId, checkedInCount: { $gt: 0 } },
      { $inc: { checkedInCount: -1 } }
    );
  }

  await logAdminAttendanceActivity({
    adminUserId: req.user!.userId,
    action: 'admin_cancel_registration',
    eventId,
    resourceId: regId,
    outcome: 'success',
    studentId: String(registration.studentId),
  });

  res.status(200).json({
    success: true,
    data: { registration },
  });
};

export const adminUpdateRegistrationStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id: eventId, regId } = req.params;
  const { status } = req.body as { status?: string };

  if (!status || !Object.values(EventRegistrationStatus).includes(status as EventRegistrationStatus)) {
    throw new AppError('Valid status is required', 400);
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  await ensureCanManageOwnedContent(
    req.user,
    Permission.MANAGE_EVENT_REGISTRATIONS,
    event.ownerType,
    event.organizationId ?? null
  );

  const registration = await EventRegistration.findById(regId);
  if (!registration) {
    throw new AppError('Registration not found', 404);
  }

  if (registration.eventId.toString() !== eventId) {
    throw new AppError('Registration does not belong to this event', 400);
  }

  const prevStatus = registration.status;
  const nextStatus = status as EventRegistrationStatus;

  if (prevStatus === nextStatus) {
    throw new AppError(`Registration is already in status ${prevStatus}`, 400);
  }

  const VALID_TRANSITIONS: Record<string, string[]> = {
    [EventRegistrationStatus.REGISTERED]: [
      EventRegistrationStatus.CHECKED_IN,
      EventRegistrationStatus.CANCELLED,
    ],
    [EventRegistrationStatus.CHECKED_IN]: [
      EventRegistrationStatus.REGISTERED,
      EventRegistrationStatus.CANCELLED,
    ],
    [EventRegistrationStatus.CANCELLED]: [
      EventRegistrationStatus.REGISTERED,
      EventRegistrationStatus.CHECKED_IN,
    ],
  };

  const allowed = VALID_TRANSITIONS[prevStatus];
  if (!allowed?.includes(nextStatus)) {
    throw new AppError(`Cannot transition from ${prevStatus} to ${nextStatus}`, 400);
  }

  registration.status = nextStatus;

  if (prevStatus === EventRegistrationStatus.CHECKED_IN && nextStatus !== EventRegistrationStatus.CHECKED_IN) {
    await Event.findOneAndUpdate(
      { _id: eventId, checkedInCount: { $gt: 0 } },
      { $inc: { checkedInCount: -1 } }
    );
  }

  if (nextStatus === EventRegistrationStatus.CANCELLED && !registration.cancelledAt) {
    registration.cancelledAt = new Date();
    await releaseCapacity(eventId);
  }

  if (nextStatus === EventRegistrationStatus.REGISTERED && prevStatus === EventRegistrationStatus.CANCELLED) {
    await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1 } });
    registration.cancelledAt = undefined;
  }

  if (nextStatus === EventRegistrationStatus.CHECKED_IN && prevStatus === EventRegistrationStatus.CANCELLED) {
    await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1, checkedInCount: 1 } });
    registration.checkedInAt = new Date();
    registration.scanCount += 1;
    registration.cancelledAt = undefined;
  } else if (nextStatus === EventRegistrationStatus.CHECKED_IN && !registration.checkedInAt) {
    registration.checkedInAt = new Date();
    registration.scanCount += 1;
    await Event.findByIdAndUpdate(eventId, { $inc: { checkedInCount: 1 } });
  }

  await registration.save();

  await logAdminAttendanceActivity({
    adminUserId: req.user!.userId,
    action: 'admin_update_registration_status',
    eventId,
    resourceId: regId,
    outcome: 'success',
    studentId: String(registration.studentId),
  });

  res.status(200).json({
    success: true,
    data: { registration },
  });
};

export const adminCreateRegistration = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  await ensureCanManageOwnedContent(
    req.user,
    Permission.MANAGE_EVENT_REGISTRATIONS,
    event.ownerType,
    event.organizationId ?? null
  );

  const { studentNumber } = req.body as { studentNumber?: string };
  if (!studentNumber) {
    throw new AppError('Student number is required', 400);
  }

  const student = await Student.findOne({ studentNumber: studentNumber.trim().toUpperCase() });
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  if (!isStudentEligibleForEvent(event, student)) {
    throw new AppError('Student is not eligible for this event', 403);
  }

  const existingRegistration = await EventRegistration.findOne({
    eventId: event._id,
    studentId: student._id,
    status: { $in: [EventRegistrationStatus.REGISTERED, EventRegistrationStatus.CHECKED_IN] },
  });

  if (existingRegistration) {
    throw new AppError('Student is already registered for this event', 409);
  }

  const capacityUpdate =
    event.maxAttendees && event.maxAttendees > 0
      ? await Event.findOneAndUpdate(
          { _id: event._id, registeredCount: { $lt: event.maxAttendees } },
          { $inc: { registeredCount: 1 } },
          { new: true }
        )
      : await Event.findByIdAndUpdate(event._id, { $inc: { registeredCount: 1 } }, { new: true });

  if (!capacityUpdate) {
    throw new AppError('Event is already full', 409);
  }

  const registration = await EventRegistration.create({
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
    source: 'admin',
  });

  await logAdminAttendanceActivity({
    adminUserId: req.user!.userId,
    action: 'admin_create_registration',
    eventId: String(event._id),
    resourceId: String(registration._id),
    outcome: 'success',
    studentId: String(student._id),
  });

  res.status(201).json({
    success: true,
    data: { registration },
  });
};

export const adminUndoCheckIn = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id: eventId, regId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  await ensureCanManageOwnedContent(
    req.user,
    Permission.MANAGE_EVENT_REGISTRATIONS,
    event.ownerType,
    event.organizationId ?? null
  );

  const registration = await EventRegistration.findById(regId);
  if (!registration) {
    throw new AppError('Registration not found', 404);
  }

  if (registration.eventId.toString() !== eventId) {
    throw new AppError('Registration does not belong to this event', 400);
  }

  if (registration.status !== EventRegistrationStatus.CHECKED_IN) {
    throw new AppError('Registration is not checked in', 400);
  }

  registration.status = EventRegistrationStatus.REGISTERED;
  registration.checkedInAt = undefined;
  registration.scanCount = Math.max(0, (registration.scanCount || 1) - 1);
  await registration.save();

  await Event.findOneAndUpdate(
    { _id: eventId, checkedInCount: { $gt: 0 } },
    { $inc: { checkedInCount: -1 } }
  );

  await logAdminAttendanceActivity({
    adminUserId: req.user!.userId,
    action: 'admin_undo_check_in',
    eventId,
    resourceId: regId,
    outcome: 'success',
    studentId: String(registration.studentId),
  });

  res.status(200).json({
    success: true,
    data: { registration },
  });
};
