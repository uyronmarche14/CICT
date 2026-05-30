import express from 'express';
import { authenticate as protect } from '../middleware/auth';
import { authorize, requireAdminAccess } from '../middleware/permissions';
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

router.get('/:orgId/collaborations', authorize(Permission.MANAGE_ORG_COLLABORATION), listSpaces);
router.post('/:orgId/collaborations', authorize(Permission.MANAGE_ORG_COLLABORATION), validate(createSpaceValidator), logActivity('create', 'collab_space'), createSpace);
router.get('/:orgId/collaborations/:id', authorize(Permission.MANAGE_ORG_COLLABORATION), getSpace);
router.put('/:orgId/collaborations/:id', authorize(Permission.MANAGE_ORG_COLLABORATION), validate(updateSpaceValidator), logActivity('update', 'collab_space'), updateSpace);
router.delete('/:orgId/collaborations/:id', authorize(Permission.MANAGE_ORG_COLLABORATION), validate(spaceIdValidator), logActivity('delete', 'collab_space'), deleteSpace);
router.get('/:orgId/collaborations/:id/messages', authorize(Permission.MANAGE_ORG_COLLABORATION), listMessages);
router.post('/:orgId/collaborations/:id/messages', authorize(Permission.MANAGE_ORG_COLLABORATION), validate(sendMessageValidator), logActivity('send', 'collab_message'), sendMessage);
router.delete('/:orgId/collaborations/:id/messages/:msgId', authorize(Permission.MANAGE_ORG_COLLABORATION), validate(messageIdValidator), logActivity('delete', 'collab_message'), deleteMessage);

export default router;
