import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdminAccess } from '../middleware/permissions';
import { validate } from '../middleware/validate';
import {
  getAllSettings,
  getSettingsGroup,
  updateSettingsGroup,
} from '../controllers/settings.controller';
import {
  settingsGroupValidator,
  updateSettingsValidator,
} from '../validators/settings.validator';

const router = Router();

router.use(authenticate);
router.use(requireAdminAccess);

router.get('/', getAllSettings);

router.get(
  '/:group',
  validate(settingsGroupValidator),
  getSettingsGroup
);

router.put(
  '/:group',
  validate(updateSettingsValidator),
  updateSettingsGroup
);

export default router;
