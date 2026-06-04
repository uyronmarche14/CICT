import express from 'express';
import {
  getOverview,
  getTaskAnalytics,
  getEventAnalytics,
  getFinancialAnalytics,
  getEngagement,
  getTaskForceAnalytics,
  getResourceAnalytics,
  getPartnershipAnalytics,
  getCollaborationAnalytics,
  getMentorshipAnalytics,
  getSharedContentAnalytics,
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
router.get('/:orgId/analytics/task-forces', authorize(Permission.VIEW_ORG_ANALYTICS), getTaskForceAnalytics);
router.get('/:orgId/analytics/resources', authorize(Permission.VIEW_ORG_ANALYTICS), getResourceAnalytics);
router.get('/:orgId/analytics/partnerships', authorize(Permission.VIEW_ORG_ANALYTICS), getPartnershipAnalytics);
router.get('/:orgId/analytics/collaborations', authorize(Permission.VIEW_ORG_ANALYTICS), getCollaborationAnalytics);
router.get('/:orgId/analytics/mentorships', authorize(Permission.VIEW_ORG_ANALYTICS), getMentorshipAnalytics);
router.get('/:orgId/analytics/shared-content', authorize(Permission.VIEW_ORG_ANALYTICS), getSharedContentAnalytics);
router.get('/:orgId/analytics/export', authorize(Permission.VIEW_ORG_ANALYTICS), exportReport);

export default router;
