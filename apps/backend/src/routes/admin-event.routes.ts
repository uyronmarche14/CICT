import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdminAccess } from '../middleware/permissions';
import { validate } from '../middleware/validate';
import { eventIdValidator, eventRegIdValidator } from '../validators/event.validator';
import {
  getEventRegistrationsForAdmin,
  searchEventRegistrations,
  getEventAttendanceLogs,
  exportEventAttendanceLogs,
  scanEventAttendance,
  adminCancelRegistration,
  adminUpdateRegistrationStatus,
  adminCreateRegistration,
  adminUndoCheckIn,
} from '../controllers/eventRegistration.controller';

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
router.post('/:id/attendance/scan', validate(eventIdValidator), scanEventAttendance);

export default router;
