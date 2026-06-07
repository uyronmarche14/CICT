import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdminAccess } from '../middleware/permissions';
import {
  getLookupByKind,
  getReferenceData,
} from '../controllers/lookup.controller';

const router = Router();

router.use(authenticate);
router.use(requireAdminAccess);

router.get('/reference-data', getReferenceData);
router.get('/:kind', getLookupByKind);

export default router;
