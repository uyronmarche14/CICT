import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  listMeetings as listMeetingsService,
  createMeeting as createMeetingService,
  getMeeting as getMeetingService,
  updateMeeting as updateMeetingService,
  deleteMeeting as deleteMeetingService,
  updateMinutes as updateMinutesService,
  updateActionItems as updateActionItemsService,
} from '../services/org-meeting.service';

export const listMeetings = async (req: AuthRequest, res: Response) => {
  const data = await listMeetingsService(req, req.params.orgId);
  res.json({ success: true, data });
};

export const createMeeting = async (req: AuthRequest, res: Response) => {
  const data = await createMeetingService(req, req.params.orgId);
  res.status(201).json({ success: true, data });
};

export const getMeeting = async (req: AuthRequest, res: Response) => {
  const data = await getMeetingService(req, req.params.orgId, req.params.meetingId);
  res.json({ success: true, data });
};

export const updateMeeting = async (req: AuthRequest, res: Response) => {
  const data = await updateMeetingService(req, req.params.orgId, req.params.meetingId);
  res.json({ success: true, data });
};

export const deleteMeeting = async (req: AuthRequest, res: Response) => {
  await deleteMeetingService(req, req.params.orgId, req.params.meetingId);
  res.json({ success: true, message: 'Meeting deleted' });
};

export const updateMinutes = async (req: AuthRequest, res: Response) => {
  const data = await updateMinutesService(req, req.params.orgId, req.params.meetingId);
  res.json({ success: true, data });
};

export const updateActionItems = async (req: AuthRequest, res: Response) => {
  const data = await updateActionItemsService(req, req.params.orgId, req.params.meetingId);
  res.json({ success: true, data });
};
