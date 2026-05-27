import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Event from '../models/Event';
import EventRegistration from '../models/EventRegistration';
import ActivityLog from '../models/ActivityLog';
import { AppError } from '../middleware/errorHandler';
import { EventRegistrationStatus, EventStatus } from '../types';

const getStudentQrSecret = (): string => {
  const secret = process.env.STUDENT_QR_SECRET;
  if (!secret) {
    throw new Error('STUDENT_QR_SECRET is not configured');
  }
  return secret;
};

export const createQrNonce = (): string => crypto.randomBytes(16).toString('hex');

export const buildQrToken = (payload: Record<string, unknown>): string =>
  jwt.sign(payload, getStudentQrSecret(), {
    expiresIn: process.env.STUDENT_QR_EXPIRE || '7d',
  } as jwt.SignOptions);

export const isStudentEligibleForEvent = (
  event: {
    targetProgramIds?: string[];
    targetYearLevelIds?: string[];
    targetSectionIds?: string[];
  },
  student: {
    programId: unknown;
    yearLevelId: unknown;
    sectionId: unknown;
  }
): boolean => {
  const programId = String(student.programId);
  const yearLevelId = String(student.yearLevelId);
  const sectionId = String(student.sectionId);

  const matchesPrograms =
    !event.targetProgramIds || event.targetProgramIds.length === 0 || event.targetProgramIds.includes(programId);
  const matchesYearLevels =
    !event.targetYearLevelIds ||
    event.targetYearLevelIds.length === 0 ||
    event.targetYearLevelIds.includes(yearLevelId);
  const matchesSections =
    !event.targetSectionIds ||
    event.targetSectionIds.length === 0 ||
    event.targetSectionIds.includes(sectionId);

  return matchesPrograms && matchesYearLevels && matchesSections;
};

export const ensureEventOpenForRegistration = (event: {
  status: EventStatus;
  isRegistrationOpen: boolean;
  registrationCloseAt?: Date;
}) => {
  if (event.status !== EventStatus.PUBLISHED) {
    throw new AppError('Event is not open for registration', 400);
  }

  if (!event.isRegistrationOpen) {
    throw new AppError('Event registration is closed', 400);
  }

  if (event.registrationCloseAt && event.registrationCloseAt < new Date()) {
    throw new AppError('Event registration has already closed', 400);
  }
};

export const logStudentActivity = async (input: {
  action: string;
  resource: string;
  resourceId?: string;
  studentId?: string;
  eventId?: string;
  outcome?: 'success' | 'failure' | 'denied' | 'duplicate';
  reasonCode?: string;
  details?: Record<string, unknown>;
}) => {
  await ActivityLog.create({
    actorType: 'student',
    actorId: input.studentId,
    studentId: input.studentId,
    eventId: input.eventId,
    action: input.action,
    resource: input.resource,
    resourceId: input.resourceId,
    outcome: input.outcome,
    reasonCode: input.reasonCode,
    details: input.details,
    severity: input.outcome === 'failure' || input.outcome === 'denied' ? 'warn' : 'info',
  });
};

export const logAdminAttendanceActivity = async (input: {
  adminUserId: string;
  action: string;
  eventId: string;
  resourceId?: string;
  outcome: 'success' | 'failure' | 'denied' | 'duplicate';
  studentId?: string;
  reasonCode?: string;
  details?: Record<string, unknown>;
}) => {
  await ActivityLog.create({
    user: input.adminUserId,
    actorType: 'admin',
    actorId: input.adminUserId,
    action: input.action,
    resource: 'event_attendance',
    resourceId: input.resourceId,
    eventId: input.eventId,
    studentId: input.studentId,
    outcome: input.outcome,
    reasonCode: input.reasonCode,
    details: input.details,
    severity: input.outcome === 'success' ? 'info' : 'warn',
  });
};

export const incrementCheckedInCount = async (eventId: string) => {
  await Event.findByIdAndUpdate(eventId, { $inc: { checkedInCount: 1 } });
};

export const reserveCapacity = async (
  eventId: string,
  maxAttendees?: number
): Promise<boolean> => {
  const filter: Record<string, unknown> = { _id: eventId };
  if (maxAttendees && maxAttendees > 0) {
    filter.registeredCount = { $lt: maxAttendees };
  }
  const result = await Event.findOneAndUpdate(
    filter,
    { $inc: { registeredCount: 1 } },
    { new: true }
  );
  return !!result;
};

export const releaseCapacity = async (eventId: string): Promise<void> => {
  await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: -1 } });
};

export const checkRegistrationDuplicate = async (
  eventId: unknown,
  studentId: unknown
): Promise<boolean> => {
  const existing = await EventRegistration.findOne({
    eventId,
    studentId,
    status: { $in: [EventRegistrationStatus.REGISTERED, EventRegistrationStatus.CHECKED_IN] },
  });
  return !!existing;
};
