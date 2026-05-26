import { Router } from 'express';
import * as processController from '../controllers/process.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { requireAdminAccess } from '../middleware/permissions';
import { validate } from '../middleware/validate';
import { logActivity } from '../middleware/activityLogger';
import {
  createProcessTemplateValidator,
  updateProcessTemplateValidator,
  createProcessInstanceValidator,
  updateProcessInstanceValidator,
  processIdValidator,
  transitionStatusValidator,
  addProcessCommentValidator,
  toggleProcessRequirementValidator,
  approveProcessStepValidator,
  advanceInstanceValidator,
  updateChecklistItemValidator,
} from '../validators/process.validator';

const router: Router = Router();

router.post(
  '/templates',
  authenticate,
  requireAdminAccess,
  validate(createProcessTemplateValidator),
  logActivity('create', 'process_template'),
  processController.createProcessTemplate
);

router.get(
  '/templates',
  optionalAuthenticate,
  processController.getAllProcessTemplates
);

router.get(
  '/templates/:id',
  optionalAuthenticate,
  validate(processIdValidator),
  processController.getProcessTemplateById
);

router.put(
  '/templates/:id',
  authenticate,
  requireAdminAccess,
  validate(updateProcessTemplateValidator),
  logActivity('update', 'process_template'),
  processController.updateProcessTemplate
);

router.delete(
  '/templates/:id',
  authenticate,
  requireAdminAccess,
  validate(processIdValidator),
  logActivity('delete', 'process_template'),
  processController.deleteProcessTemplate
);

router.post(
  '/instances',
  authenticate,
  requireAdminAccess,
  validate(createProcessInstanceValidator),
  logActivity('create', 'process_instance'),
  processController.createProcessInstance
);

router.get(
  '/instances',
  optionalAuthenticate,
  processController.getAllProcessInstances
);

router.get(
  '/instances/:id',
  optionalAuthenticate,
  validate(processIdValidator),
  processController.getProcessInstanceById
);

router.put(
  '/instances/:id',
  authenticate,
  requireAdminAccess,
  validate(updateProcessInstanceValidator),
  logActivity('update', 'process_instance'),
  processController.updateProcessInstance
);

router.delete(
  '/instances/:id',
  authenticate,
  requireAdminAccess,
  validate(processIdValidator),
  logActivity('archive', 'process_instance'),
  processController.deleteProcessInstance
);

router.patch(
  '/instances/:id/status',
  authenticate,
  requireAdminAccess,
  validate(transitionStatusValidator),
  logActivity('transition', 'process_instance'),
  processController.transitionProcessStatus
);

router.patch(
  '/instances/:id/comments',
  authenticate,
  requireAdminAccess,
  validate(addProcessCommentValidator),
  logActivity('comment', 'process_instance'),
  processController.addProcessComment
);

router.patch(
  '/instances/:id/requirements/:reqId',
  authenticate,
  requireAdminAccess,
  validate(toggleProcessRequirementValidator),
  logActivity('requirement', 'process_instance'),
  processController.toggleProcessRequirement
);

router.patch(
  '/instances/:id/approve-step',
  authenticate,
  requireAdminAccess,
  validate(approveProcessStepValidator),
  logActivity('approve_step', 'process_instance'),
  processController.approveProcessStep
);

router.patch(
  '/instances/:id/advance',
  authenticate,
  requireAdminAccess,
  validate(advanceInstanceValidator),
  logActivity('advance', 'process_instance'),
  processController.advanceProcessInstance
);

router.patch(
  '/instances/:id/checklist-item',
  authenticate,
  requireAdminAccess,
  validate(updateChecklistItemValidator),
  logActivity('checklist', 'process_instance'),
  processController.updateChecklistItem
);

router.get(
  '/instances/:id/activity',
  authenticate,
  requireAdminAccess,
  validate(processIdValidator),
  processController.getProcessInstanceActivity
);

export default router;
