import { Response, NextFunction } from 'express';
import { Router } from 'express';
import { getPendingApprovals, getApprovalStats, getApprovalHistory } from '../controllers/approval.controller';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireAdminAccess } from '../middleware/permissions';
import { Permission } from '../types';
import { validate } from '../middleware/validate';
import { contentTypeValidator, contentIdValidator, paginationValidator } from '../validators/approval.validator';
import { hasGlobalPermission } from '../utils/rbac';

const authorizeContentApproval = (...allowedPermissions: Permission[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const hasGlobal = allowedPermissions.some((p) => hasGlobalPermission(req.user!, p));
    if (hasGlobal) {
      next();
      return;
    }

    const hasScoped = (req.user.organizationAssignments ?? []).some((assignment) =>
      allowedPermissions.some((p) => assignment.permissions.includes(p))
    );
    if (hasScoped) {
      next();
      return;
    }

    res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
  };
};

const router = Router();

router.use(authenticate);
router.use(requireAdminAccess);

router.get(
  '/pending',
  authorizeContentApproval(Permission.APPROVE_CONTENT, Permission.REJECT_CONTENT),
  validate(paginationValidator),
  getPendingApprovals
);

router.get(
  '/stats',
  authorizeContentApproval(Permission.APPROVE_CONTENT, Permission.REJECT_CONTENT),
  getApprovalStats
);

router.get(
  '/history/:contentType/:contentId',
  authorizeContentApproval(Permission.APPROVE_CONTENT, Permission.REJECT_CONTENT, Permission.VIEW_LOGS),
  validate([...contentTypeValidator, ...contentIdValidator]),
  getApprovalHistory
);

export default router;
