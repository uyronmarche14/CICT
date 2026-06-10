import express from 'express';
import { authenticate as protect } from '../middleware/auth';
import { authorize, requireAdminAccess } from '../middleware/permissions';
import { Permission } from '../types';
import { validate } from '../middleware/validate';
import { logActivity } from '../middleware/activityLogger';
import { listMentorships, createMentorship, getMentorship, updateMentorshipStatus, deleteMentorship } from '../controllers/org-mentorship.controller';
import { createMentorshipValidator, mentorshipIdValidator, mentorshipStatusValidator } from '../validators/org-mentorship.validator';

const router = express.Router();
router.use(protect, requireAdminAccess, authorize(Permission.MANAGE_ORG_MENTORSHIP));

router.get('/:orgId/mentorships', listMentorships);
router.post('/:orgId/mentorships', validate(createMentorshipValidator), logActivity('create', 'org_mentorship'), createMentorship);
router.get('/:orgId/mentorships/:id', getMentorship);
router.patch('/:orgId/mentorships/:id/status', validate(mentorshipStatusValidator), logActivity('update', 'org_mentorship'), updateMentorshipStatus);
router.delete('/:orgId/mentorships/:id', validate(mentorshipIdValidator), logActivity('delete', 'org_mentorship'), deleteMentorship);

export default router;
