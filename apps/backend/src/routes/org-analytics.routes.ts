import express from 'express';
import {
  getOverview,
  getTaskAnalytics,
  getEventAnalytics,
  getFinancialAnalytics,
  getEngagement,
  exportReport,
} from '../controllers/org-analytics.controller';
import { authenticate as protect } from '../middleware/auth';
import { authorize, requireAdminAccess } from '../middleware/permissions';
import { Permission } from '../types';

const router = express.Router();

router.use(protect, requireAdminAccess);

router.get('/:orgId/analytics/overview', authorize(Permission.VIEW_ORG_ANALYTICS), getOverview);
router.get('/:orgId/analytics/tasks', authorize(Permission.VIEW_ORG_ANALYTICS), getTaskAnalytics);
router.get('/:orgId/analytics/events', authorize(Permission.VIEW_ORG_ANALYTICS), getEventAnalytics);
router.get('/:orgId/analytics/financial', authorize(Permission.VIEW_ORG_ANALYTICS), getFinancialAnalytics);
router.get('/:orgId/analytics/engagement', authorize(Permission.VIEW_ORG_ANALYTICS), getEngagement);
router.get('/:orgId/analytics/export', authorize(Permission.VIEW_ORG_ANALYTICS), exportReport);

export default router;
