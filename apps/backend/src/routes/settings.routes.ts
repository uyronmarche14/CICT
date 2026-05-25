import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdminAccess } from '../middleware/permissions';
import { validate } from '../middleware/validate';
import { body, param } from 'express-validator';
import {
  getAllSettings,
  getSettingsGroup,
  updateSettingsGroup,
} from '../controllers/settings.controller';
import { SETTINGS_GROUPS } from '../config/settings';

const router = Router();

router.use(authenticate);
router.use(requireAdminAccess);

router.get('/', getAllSettings);

router.get(
  '/:group',
  param('group').isIn(SETTINGS_GROUPS).withMessage('Invalid settings group'),
  validate,
  getSettingsGroup
);

router.put(
  '/:group',
  param('group').isIn(SETTINGS_GROUPS).withMessage('Invalid settings group'),
  body().isObject().withMessage('Body must be an object'),
  validate,
  updateSettingsGroup
);

export default router;
