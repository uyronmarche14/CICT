import express from 'express';
import { authenticate as protect } from '../middleware/auth';
import { authorizeOrganizationScope, requireAdminAccess } from '../middleware/permissions';
import { Permission } from '../types';
import { validate } from '../middleware/validate';
import { logActivity } from '../middleware/activityLogger';
import {
  listSpaces, createSpace, getSpace, updateSpace, deleteSpace,
  listMessages, sendMessage, deleteMessage,
} from '../controllers/org-collaboration.controller';
import {
  createSpaceValidator, updateSpaceValidator, spaceIdValidator,
  sendMessageValidator, messageIdValidator,
} from '../validators/org-collaboration.validator';

const router = express.Router();
router.use(protect, requireAdminAccess);

const canManageCollaboration = authorizeOrganizationScope(Permission.MANAGE_ORG_COLLABORATION);

router.get('/:orgId/collaborations', canManageCollaboration, listSpaces);
router.post('/:orgId/collaborations', canManageCollaboration, validate(createSpaceValidator), logActivity('create', 'collab_space'), createSpace);
router.get('/:orgId/collaborations/:id', canManageCollaboration, getSpace);
router.put('/:orgId/collaborations/:id', canManageCollaboration, validate(updateSpaceValidator), logActivity('update', 'collab_space'), updateSpace);
router.delete('/:orgId/collaborations/:id', canManageCollaboration, validate(spaceIdValidator), logActivity('delete', 'collab_space'), deleteSpace);
router.get('/:orgId/collaborations/:id/messages', canManageCollaboration, listMessages);
router.post('/:orgId/collaborations/:id/messages', canManageCollaboration, validate(sendMessageValidator), logActivity('send', 'collab_message'), sendMessage);
router.delete('/:orgId/collaborations/:id/messages/:msgId', canManageCollaboration, validate(messageIdValidator), logActivity('delete', 'collab_message'), deleteMessage);

export default router;
