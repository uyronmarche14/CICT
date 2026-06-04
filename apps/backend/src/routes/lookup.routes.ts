import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdminAccess } from '../middleware/permissions';
import {
  getContent,
  getOrganizations,
  getReferenceData,
  getStudents,
  getUsers,
} from '../controllers/lookup.controller';

const router = Router();

router.use(authenticate);
router.use(requireAdminAccess);

router.get('/organizations', getOrganizations);
router.get('/users', getUsers);
router.get('/students', getStudents);
router.get('/content', getContent);
router.get('/reference-data', getReferenceData);

export default router;
