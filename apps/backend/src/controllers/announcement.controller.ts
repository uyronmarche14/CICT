import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import {
  createAnnouncement as createAnnouncementService,
  getAllAnnouncements as getAllAnnouncementsService,
  getAnnouncementById as getAnnouncementByIdService,
  getPublicAnnouncements as getPublicAnnouncementsService,
  getPublicAnnouncementById as getPublicAnnouncementByIdService,
  updateAnnouncement as updateAnnouncementService,
  deleteAnnouncement as deleteAnnouncementService,
  submitAnnouncementForApproval as submitAnnouncementForApprovalService,
  approveAnnouncement as approveAnnouncementService,
  rejectAnnouncement as rejectAnnouncementService,
  publishAnnouncement as publishAnnouncementService,
  archiveAnnouncement as archiveAnnouncementService,
} from '../services/announcement.service';

/**
 * Create new announcement
 */
export const createAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const announcement = await createAnnouncementService(req);

  res.status(201).json({
    success: true,
    message: 'Announcement created successfully',
    data: { announcement },
  });
};

/**
 * Get all announcements
 */
export const getAllAnnouncements = async (req: AuthRequest, res: Response): Promise<void> => {
  const result = await getAllAnnouncementsService(req);

  res.status(200).json({
    success: true,
    data: result,
  });
};

/**
 * Public announcements
 */
export const getPublicAnnouncements = async (req: Request, res: Response): Promise<void> => {
  const result = await getPublicAnnouncementsService(req);

  res.status(200).json({
    success: true,
    data: result,
  });
};

/**
 * Get single announcement by ID
 */
export const getAnnouncementById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const announcement = await getAnnouncementByIdService(id, req);

  res.status(200).json({
    success: true,
    data: { announcement },
  });
};

export const getPublicAnnouncementById = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const announcement = await getPublicAnnouncementByIdService(id);

  res.status(200).json({
    success: true,
    data: { announcement },
  });
};

/**
 * Update announcement
 */
export const updateAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const announcement = await updateAnnouncementService(id, req);

  res.status(200).json({
    success: true,
    message: 'Announcement updated successfully',
    data: { announcement },
  });
};

export const submitAnnouncementForApproval = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const updated = await submitAnnouncementForApprovalService(id, req);

  res.status(200).json({
    success: true,
    message: 'Announcement submitted for approval',
    data: { announcement: updated },
  });
};

export const approveAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updated = await approveAnnouncementService(id, req);

  res.status(200).json({
    success: true,
    message: 'Announcement approved successfully',
    data: { announcement: updated },
  });
};

export const rejectAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updated = await rejectAnnouncementService(id, req);

  res.status(200).json({
    success: true,
    message: 'Announcement rejected successfully',
    data: { announcement: updated },
  });
};

/**
 * Delete announcement
 */
export const deleteAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await deleteAnnouncementService(id, req);

  res.status(200).json({
    success: true,
    message: 'Announcement deleted successfully',
  });
};

/**
 * Publish announcement
 */
export const publishAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updated = await publishAnnouncementService(id, req);

  res.status(200).json({
    success: true,
    message: 'Announcement published successfully',
    data: { announcement: updated },
  });
};

/**
 * Archive announcement
 */
export const archiveAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updated = await archiveAnnouncementService(id, req);

  res.status(200).json({
    success: true,
    message: 'Announcement archived successfully',
    data: { announcement: updated },
  });
};
