import Event from '../models/Event';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { EventStatus, Permission } from '../types';
import { ensureCanManageOwnedContent } from '../utils/organizationScope';
import { recordContentApprovalAction } from '../utils/contentApproval';
import { recordActivity } from './activity.service';
import * as approvalService from './content-approval.service';
import logger from '../utils/logger';

const CONTENT_TYPE = 'event';

export const submitForApproval = async (id: string, req: AuthRequest) => {
  const event = await Event.findById(id).populate('organizer', 'firstName lastName email');
  const updated = await approvalService.submitForApproval(
    id, req.user, event, CONTENT_TYPE, Permission.SUBMIT_CONTENT_FOR_APPROVAL,
    EventStatus.DRAFT, EventStatus.PENDING_APPROVAL,
    typeof req.body.comment === 'string' ? req.body.comment.trim() : undefined
  );
  return updated;
};

export const approve = async (id: string, req: AuthRequest) => {
  const event = await Event.findById(id).populate('organizer', 'firstName lastName email');
  const updated = await approvalService.approve(
    id, req.user, event, CONTENT_TYPE,
    EventStatus.PENDING_APPROVAL, EventStatus.APPROVED,
    typeof req.body.comment === 'string' ? req.body.comment.trim() : undefined
  );
  return updated;
};

export const reject = async (id: string, req: AuthRequest) => {
  const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : '';
  const event = await Event.findById(id).populate('organizer', 'firstName lastName email');
  const updated = await approvalService.reject(
    id, req.user, event, CONTENT_TYPE,
    EventStatus.PENDING_APPROVAL, EventStatus.REJECTED, reason,
    typeof req.body.comment === 'string' ? req.body.comment.trim() : undefined
  );
  return updated;
};

export const publish = async (id: string, req: AuthRequest) => {
  const event = await Event.findById(id).populate('organizer', 'firstName lastName email');
  const updated = await approvalService.publish(
    id, req.user, event, CONTENT_TYPE, Permission.PUBLISH_EVENT, EventStatus.PUBLISHED,
    (item) => {
      const e = item as Record<string, unknown>;
      e.cancelledAt = undefined;
      e.completedAt = undefined;
    }
  );

  logger.info(`Event published: ${id} by user ${req.user?.userId}`);
  return updated;
};

export const cancel = async (id: string, req: AuthRequest) => {
  const event = await Event.findById(id).populate('organizer', 'firstName lastName email');

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (event.status !== EventStatus.PUBLISHED) {
    throw new AppError('Only published events can be cancelled', 400);
  }

  await ensureCanManageOwnedContent(
    req.user,
    Permission.CANCEL_EVENT,
    event.ownerType,
    event.organizationId ?? null
  );

  event.status = EventStatus.CANCELLED;
  event.cancelledAt = new Date();
  await event.save();

  await recordContentApprovalAction({
    contentType: 'event',
    contentId: id,
    actorUserId: req.user!.userId,
    action: 'cancelled',
    fromStatus: EventStatus.PUBLISHED,
    toStatus: EventStatus.CANCELLED,
  });

  await recordActivity({
    organizationId: event.organizationId ?? '',
    actorType: 'admin',
    actorId: req.user?.userId,
    action: 'cancelled',
    entityType: 'event',
    entityId: id,
    metadata: { fromStatus: 'published', toStatus: 'cancelled' },
  });

  logger.info(`Event cancelled: ${id} by user ${req.user?.userId}`);
  return event;
};

export const complete = async (id: string, req: AuthRequest) => {
  const event = await Event.findById(id).populate('organizer', 'firstName lastName email');

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (event.status !== EventStatus.PUBLISHED) {
    throw new AppError('Only published events can be completed', 400);
  }

  await ensureCanManageOwnedContent(
    req.user,
    Permission.COMPLETE_EVENT,
    event.ownerType,
    event.organizationId ?? null
  );

  event.status = EventStatus.COMPLETED;
  event.completedAt = new Date();
  await event.save();

  await recordContentApprovalAction({
    contentType: 'event',
    contentId: id,
    actorUserId: req.user!.userId,
    action: 'completed',
    fromStatus: EventStatus.PUBLISHED,
    toStatus: EventStatus.COMPLETED,
  });

  await recordActivity({
    organizationId: event.organizationId ?? '',
    actorType: 'admin',
    actorId: req.user?.userId,
    action: 'completed',
    entityType: 'event',
    entityId: id,
    metadata: { fromStatus: 'published', toStatus: 'completed' },
  });

  logger.info(`Event completed: ${id} by user ${req.user?.userId}`);
  return event;
};
