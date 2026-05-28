import express from 'express';
import { getPublicMember } from '../controllers/organization.controller';

const router = express.Router();

router.get('/:memberId', getPublicMember);

export default router;
