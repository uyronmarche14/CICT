import { Router } from 'express';
import { getUpdatesFeed } from '../controllers/updates.controller';

const router = Router();

router.get('/', getUpdatesFeed);

export default router;
