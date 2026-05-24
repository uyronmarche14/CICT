import { Router } from 'express';
import { authenticateStudent } from '../middleware/studentAuth';
import * as pushTokenController from '../controllers/pushToken.controller';

const router = Router();

router.use(authenticateStudent);

router.post('/push-token/register', pushTokenController.registerPushToken);
router.post('/push-token/unregister', pushTokenController.unregisterPushToken);

export default router;
