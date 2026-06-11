import express from 'express';
import { authenticate as protect } from '../middleware/auth';
import { authorizeOrganizationScope, requireAdminAccess } from '../middleware/permissions';
import { Permission } from '../types';
import { validate } from '../middleware/validate';
import { logActivity } from '../middleware/activityLogger';
import { listMentorships, createMentorship, getMentorship, updateMentorshipStatus, deleteMentorship } from '../controllers/org-mentorship.controller';
import { createMentorshipValidator, mentorshipIdValidator, mentorshipStatusValidator } from '../validators/org-mentorship.validator';

const router = express.Router();
router.use(protect, requireAdminAccess);

const canManageMentorship = authorizeOrganizationScope(Permission.MANAGE_ORG_MENTORSHIP);

router.get('/:orgId/mentorships', canManageMentorship, listMentorships);
router.post('/:orgId/mentorships', canManageMentorship, validate(createMentorshipValidator), logActivity('create', 'org_mentorship'), createMentorship);
router.get('/:orgId/mentorships/:id', canManageMentorship, getMentorship);
router.patch('/:orgId/mentorships/:id/status', canManageMentorship, validate(mentorshipStatusValidator), logActivity('update', 'org_mentorship'), updateMentorshipStatus);
router.delete('/:orgId/mentorships/:id', canManageMentorship, validate(mentorshipIdValidator), logActivity('delete', 'org_mentorship'), deleteMentorship);

export default router;
