import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { getCalendarFeed, getICalExport } from '../controllers/calendar.controller';

const router = Router();

router.get('/feed', optionalAuthenticate, getCalendarFeed);
router.get('/export/ical', authenticate, getICalExport);

export default router;
