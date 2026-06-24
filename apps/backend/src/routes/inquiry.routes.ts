import { Router } from 'express';
import * as inquiryController from '../controllers/inquiry.controller';
import { authenticate } from '../middleware/auth';
import { requireAdminAccess } from '../middleware/permissions';
import { validate } from '../middleware/validate';
import {
  createInquiryValidator,
  inquiryIdValidator,
  inquiryListValidator,
  updateInquiryStatusValidator,
} from '../validators/inquiry.validator';

const router: Router = Router();

router.post('/', validate(createInquiryValidator), inquiryController.createInquiry);

router.get(
  '/',
  authenticate,
  requireAdminAccess,
  validate(inquiryListValidator),
  inquiryController.getInquiries
);

router.patch(
  '/:id/status',
  authenticate,
  requireAdminAccess,
  validate(updateInquiryStatusValidator),
  inquiryController.updateInquiryStatus
);

router.delete(
  '/:id',
  authenticate,
  requireAdminAccess,
  validate(inquiryIdValidator),
  inquiryController.deleteInquiry
);

export default router;
