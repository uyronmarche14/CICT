import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdminAccess, requireAnyAdminAction } from '../middleware/permissions';
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

router.get(
  '/:id/registrations',
  validate(eventIdValidator),
  requireAnyAdminAction(
    Permission.VIEW_EVENT,
    Permission.VIEW_EVENT_REGISTRATIONS,
    Permission.MANAGE_EVENT_REGISTRATIONS,
    Permission.SCAN_EVENT_ATTENDANCE
  ),
  getEventRegistrationsForAdmin
);
router.get(
  '/:id/registrations/search',
  validate(eventIdValidator),
  requireAnyAdminAction(
    Permission.VIEW_EVENT_REGISTRATIONS,
    Permission.MANAGE_EVENT_REGISTRATIONS,
    Permission.SCAN_EVENT_ATTENDANCE
  ),
  searchEventRegistrations
);
router.get(
  '/:id/attendance/logs',
  validate(eventIdValidator),
  requireAnyAdminAction(
    Permission.VIEW_EVENT,
    Permission.VIEW_EVENT_REGISTRATIONS,
    Permission.SCAN_EVENT_ATTENDANCE
  ),
  getEventAttendanceLogs
);
router.get(
  '/:id/attendance/logs/export',
  validate(eventIdValidator),
  requireAnyAdminAction(
    Permission.VIEW_EVENT,
    Permission.VIEW_EVENT_REGISTRATIONS,
    Permission.SCAN_EVENT_ATTENDANCE
  ),
  exportEventAttendanceLogs
);
router.post(
  '/:id/registrations',
  validate(eventIdValidator),
  requireAnyAdminAction(Permission.MANAGE_EVENT_REGISTRATIONS),
  adminCreateRegistration
);
router.post(
  '/:id/registrations/:regId/cancel',
  validate(eventRegIdValidator),
  requireAnyAdminAction(Permission.MANAGE_EVENT_REGISTRATIONS),
  adminCancelRegistration
);
router.patch(
  '/:id/registrations/:regId',
  validate(eventRegIdValidator),
  requireAnyAdminAction(Permission.MANAGE_EVENT_REGISTRATIONS),
  adminUpdateRegistrationStatus
);
router.post(
  '/:id/registrations/:regId/undo-checkin',
  validate(eventRegIdValidator),
  requireAnyAdminAction(Permission.MANAGE_EVENT_REGISTRATIONS, Permission.SCAN_EVENT_ATTENDANCE),
  adminUndoCheckIn
);
router.post(
  '/:id/attendance/scan',
  validate(eventIdValidator),
  requireAnyAdminAction(Permission.SCAN_EVENT_ATTENDANCE),
  scanEventAttendance
);

export default router;
