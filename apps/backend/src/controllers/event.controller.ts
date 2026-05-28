import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import {
  createEvent as createEventService,
  getAllEvents as getAllEventsService,
  getEventById as getEventByIdService,
  updateEvent as updateEventService,
  deleteEvent as deleteEventService,
  submitEventForApproval as submitEventForApprovalService,
  approveEvent as approveEventService,
  rejectEvent as rejectEventService,
  publishEvent as publishEventService,
  cancelEvent as cancelEventService,
  completeEvent as completeEventService,
} from '../services/event.service';

/**
 * Create new event
 */
export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const event = await createEventService(req);

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    data: { event },
  });
};

/**
 * Get all events
 */
export const getAllEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  const result = await getAllEventsService(req);

  res.status(200).json({
    success: true,
    data: result,
  });
};

/**
 * Get single event by ID
 */
export const getEventById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const result = await getEventByIdService(id, req);

  res.status(200).json({
    success: true,
    data: result,
  });
};

/**
 * Update event
 */
export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const event = await updateEventService(id, req);

  res.status(200).json({
    success: true,
    message: 'Event updated successfully',
    data: { event },
  });
};

/**
 * Delete event
 */
export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await deleteEventService(id, req);

  res.status(200).json({
    success: true,
    message: 'Event deleted successfully',
  });
};

export const submitEventForApproval = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updated = await submitEventForApprovalService(id, req);

  res.status(200).json({
    success: true,
    message: 'Event submitted for approval',
    data: { event: updated },
  });
};

export const approveEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updated = await approveEventService(id, req);

  res.status(200).json({
    success: true,
    message: 'Event approved successfully',
    data: { event: updated },
  });
};

export const rejectEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updated = await rejectEventService(id, req);

  res.status(200).json({
    success: true,
    message: 'Event rejected successfully',
    data: { event: updated },
  });
};

export const publishEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updated = await publishEventService(id, req);

  res.status(200).json({
    success: true,
    message: 'Event published successfully',
    data: { event: updated },
  });
};

export const cancelEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const event = await cancelEventService(id, req);

  res.status(200).json({
    success: true,
    message: 'Event cancelled successfully',
    data: { event },
  });
};

export const completeEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const event = await completeEventService(id, req);

  res.status(200).json({
    success: true,
    message: 'Event completed successfully',
    data: { event },
  });
};

/**
 * Join/leave are deprecated. Use the student registration flow instead.
 * These routes remain for backward compatibility and return a helpful redirect.
 */
export const joinEvent = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message:
      'Public join is deprecated. Students should use POST /api/student/events/:id/register instead.',
    data: { redirect: '/student/login' },
  });
};

export const leaveEvent = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message:
      'Public leave is deprecated. Students should use POST /api/student/events/:id/cancel-registration instead.',
    data: { redirect: '/student/login' },
  });
};
