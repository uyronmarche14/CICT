import express from 'express';
import {
  getDashboard,
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
import { authorizeOrganizationScope, requireAdminAccess } from '../middleware/permissions';
import { Permission } from '../types';

const router = express.Router();

router.use(protect, requireAdminAccess);

const canViewAnalytics = authorizeOrganizationScope(Permission.VIEW_ORG_ANALYTICS);

router.get('/:orgId/analytics/dashboard', canViewAnalytics, getDashboard);
router.get('/:orgId/analytics/overview', canViewAnalytics, getOverview);
router.get('/:orgId/analytics/tasks', canViewAnalytics, getTaskAnalytics);
router.get('/:orgId/analytics/events', canViewAnalytics, getEventAnalytics);
router.get('/:orgId/analytics/financial', canViewAnalytics, getFinancialAnalytics);
router.get('/:orgId/analytics/engagement', canViewAnalytics, getEngagement);
router.get('/:orgId/analytics/task-forces', canViewAnalytics, getTaskForceAnalytics);
router.get('/:orgId/analytics/resources', canViewAnalytics, getResourceAnalytics);
router.get('/:orgId/analytics/partnerships', canViewAnalytics, getPartnershipAnalytics);
router.get('/:orgId/analytics/collaborations', canViewAnalytics, getCollaborationAnalytics);
router.get('/:orgId/analytics/mentorships', canViewAnalytics, getMentorshipAnalytics);
router.get('/:orgId/analytics/shared-content', canViewAnalytics, getSharedContentAnalytics);
router.get('/:orgId/analytics/export', canViewAnalytics, exportReport);

export default router;
