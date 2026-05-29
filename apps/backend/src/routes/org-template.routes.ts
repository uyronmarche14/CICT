import express from 'express';
import {
  listTemplates,
  createTemplate,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  applyTemplate,
} from '../controllers/org-template.controller';
import { authenticate as protect } from '../middleware/auth';
import { authorize, requireAdminAccess } from '../middleware/permissions';
import { Permission } from '../types';
import { validate } from '../middleware/validate';
import { logActivity } from '../middleware/activityLogger';
import {
  createTemplateValidator,
  updateTemplateValidator,
  templateIdValidator,
  applyTemplateValidator,
} from '../validators/org-template.validator';

const router = express.Router();

router.use(protect, requireAdminAccess);

router.get('/', authorize(Permission.MANAGE_ORG_TEMPLATES), listTemplates);
router.post('/', authorize(Permission.MANAGE_ORG_TEMPLATES), validate(createTemplateValidator), logActivity('create', 'org_template'), createTemplate);
router.get('/:templateId', authorize(Permission.MANAGE_ORG_TEMPLATES), validate(templateIdValidator), getTemplate);
router.put('/:templateId', authorize(Permission.MANAGE_ORG_TEMPLATES), validate(updateTemplateValidator), logActivity('update', 'org_template'), updateTemplate);
router.delete('/:templateId', authorize(Permission.MANAGE_ORG_TEMPLATES), validate(templateIdValidator), logActivity('delete', 'org_template'), deleteTemplate);
router.post('/:templateId/apply', authorize(Permission.MANAGE_ORG_TEMPLATES), validate(applyTemplateValidator), logActivity('apply', 'org_template'), applyTemplate);

export default router;
