import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize, requireAdminAccess } from '../middleware/permissions';
import { Permission } from '../types';
import { validate } from '../middleware/validate';
import { eventIdValidator, eventRegIdValidator } from '../validators/event.validator';
import {
  getEventRegistrationsForAdmin,
  searchEventRegistrations,
  adminCreateRegistration,
  adminCancelRegistration,
  adminUpdateRegistrationStatus,
  adminUndoCheckIn,
} from '../controllers/admin-event-registration.controller';
import {
  getEventAttendanceLogs,
  exportEventAttendanceLogs,
  scanEventAttendance,
} from '../controllers/admin-event-attendance.controller';

const router = Router();

router.use(authenticate, requireAdminAccess);

router.get('/:id/registrations', validate(eventIdValidator), getEventRegistrationsForAdmin);
router.get('/:id/registrations/search', validate(eventIdValidator), searchEventRegistrations);
router.get('/:id/attendance/logs', validate(eventIdValidator), getEventAttendanceLogs);
router.get('/:id/attendance/logs/export', validate(eventIdValidator), exportEventAttendanceLogs);
router.post('/:id/registrations', validate(eventIdValidator), adminCreateRegistration);
router.post('/:id/registrations/:regId/cancel', validate(eventRegIdValidator), adminCancelRegistration);
router.patch('/:id/registrations/:regId', validate(eventRegIdValidator), adminUpdateRegistrationStatus);
router.post('/:id/registrations/:regId/undo-checkin', validate(eventRegIdValidator), adminUndoCheckIn);
router.post('/:id/attendance/scan', validate(eventIdValidator), authorize(Permission.SCAN_EVENT_ATTENDANCE), scanEventAttendance);

export default router;
