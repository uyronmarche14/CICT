import express from 'express';
import {
  listMeetings,
  createMeeting,
  getMeeting,
  updateMeeting,
  deleteMeeting,
  updateMinutes,
  updateActionItems,
} from '../controllers/org-meeting.controller';
import { authenticate as protect } from '../middleware/auth';
import { requireAdminAccess } from '../middleware/permissions';
import { validate } from '../middleware/validate';
import { logActivity } from '../middleware/activityLogger';
import {
  createMeetingValidator,
  updateMeetingValidator,
  meetingIdValidator,
  updateMinutesValidator,
  updateActionItemsValidator,
} from '../validators/org-meeting.validator';

const router = express.Router();

router.use(protect, requireAdminAccess);

router.get('/:orgId/meetings', listMeetings);
router.post('/:orgId/meetings', validate(createMeetingValidator), logActivity('create', 'org_meeting'), createMeeting);
router.get('/:orgId/meetings/:meetingId', validate(meetingIdValidator), getMeeting);
router.put('/:orgId/meetings/:meetingId', validate(updateMeetingValidator), logActivity('update', 'org_meeting'), updateMeeting);
router.delete('/:orgId/meetings/:meetingId', validate(meetingIdValidator), logActivity('delete', 'org_meeting'), deleteMeeting);
router.patch('/:orgId/meetings/:meetingId/minutes', validate(updateMinutesValidator), logActivity('update', 'org_meeting_minutes'), updateMinutes);
router.patch('/:orgId/meetings/:meetingId/action-items', validate(updateActionItemsValidator), logActivity('update', 'org_meeting_action_items'), updateActionItems);

export default router;
