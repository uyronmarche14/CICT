import { Router } from 'express';
import { authenticateStudent } from '../middleware/studentAuth';
import * as studentController from '../controllers/student.controller';
import * as studentEventController from '../controllers/student-event.controller';
import { validate } from '../middleware/validate';
import { eventIdValidator } from '../validators/event.validator';
import { getMyMemberships, getMyMembershipStatus, applyToOrganization, resignMembership } from '../controllers/organization-membership.controller';
import { applyToOrgValidator, membershipIdValidator } from '../validators/organization-membership.validator';

const router = Router();

router.use(authenticateStudent);

router.get('/profile', studentController.getOwnStudentProfile);
router.get('/events', studentEventController.getStudentEvents);
router.post('/events/:id/register', validate(eventIdValidator), studentEventController.registerForEvent);
router.post(
  '/events/:id/cancel-registration',
  validate(eventIdValidator),
  studentEventController.cancelEventRegistration
);
router.get(
  '/events/:id/registration',
  validate(eventIdValidator),
  studentEventController.getOwnEventRegistration
);
router.get('/registrations', studentEventController.getStudentRegistrations);
router.get('/events/:id/qr', validate(eventIdValidator), studentEventController.getEventQrPayload);
router.get('/attendance/history', studentEventController.getStudentAttendanceHistory);
router.get('/memberships', getMyMemberships);
router.get('/organizations/:orgId/membership-status', getMyMembershipStatus);
router.post('/organizations/:orgId/apply', validate(applyToOrgValidator), applyToOrganization);
router.post('/memberships/:id/resign', validate(membershipIdValidator), resignMembership);

export default router;
