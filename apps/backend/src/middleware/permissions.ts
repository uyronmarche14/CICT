import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { Permission } from '../types';
import logger from '../utils/logger';
import { canAccessAdminPanel, hasGlobalPermission } from '../utils/rbac';
import { canAccessOrganizationScope } from '../utils/organizationScope';

/**
 * Middleware to check if user has required permissions
 */
export const authorize = (...requiredPermissions: Permission[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }
      
      const { permissions: userPermissions } = req.user;
      
      // Check if user has all required permissions
      const hasPermission = requiredPermissions.every((permission) =>
        hasGlobalPermission(req.user!, permission)
      );
      
      if (!hasPermission) {
        logger.warn(`User ${req.user.userId} attempted unauthorized action`, {
          requiredPermissions,
          userPermissions,
        });
        
        res.status(403).json({
          success: false,
          message: 'You do not have permission to perform this action',
        });
        return;
      }
      
      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization check failed',
      });
    }
  };
};

export const authorizeAny = (...allowedPermissions: Permission[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { permissions: userPermissions } = req.user;

      const hasPermission = allowedPermissions.some((permission) =>
        hasGlobalPermission(req.user!, permission)
      );

      if (!hasPermission) {
        logger.warn(`User ${req.user.userId} attempted unauthorized action`, {
          allowedPermissions,
          userPermissions,
        });

        res.status(403).json({
          success: false,
          message: 'You do not have permission to perform this action',
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization check failed',
      });
    }
  };
};

export const authorizeAnyGlobalOrScoped = (...allowedPermissions: Permission[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const currentUser = req.user;
      const hasPermission = allowedPermissions.some((permission) =>
        hasGlobalPermission(currentUser, permission) ||
        currentUser.organizationAssignments?.some((assignment) =>
          assignment.permissions.includes(permission)
        )
      );

      if (!hasPermission) {
        logger.warn(`User ${currentUser.userId} attempted unauthorized scoped action`, {
          allowedPermissions,
          userPermissions: currentUser.permissions,
        });

        res.status(403).json({
          success: false,
          message: 'You do not have permission to perform this action',
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization check failed',
      });
    }
  };
};

export const authorizeOrganizationScope = (
  permission: Permission,
  paramName = 'orgId'
) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const organizationId = req.params[paramName];
      if (!organizationId || !canAccessOrganizationScope(req.user, organizationId, permission)) {
        logger.warn(`User ${req.user.userId} attempted unauthorized organization-scoped action`, {
          permission,
          organizationId,
          userPermissions: req.user.permissions,
        });

        res.status(403).json({
          success: false,
          message: 'You do not have permission for this organization',
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Organization-scoped authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization check failed',
      });
    }
  };
};

/**
 * Get default permissions for system roles
 */
export { getDefaultPermissions } from '../utils/rbac';

/**
 * Middleware to check if user can access admin features
 */
export const isAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }
  
  if (req.user.canAccessAdmin) {
    return next();
  }
  
  res.status(403).json({
    success: false,
    message: 'Admin access required',
  });
};

export const requireAdminAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  if (req.user.canAccessAdmin || canAccessAdminPanel(req.user.permissions, req.user.organizationAssignments)) {
    next();
    return;
  }

  res.status(403).json({
    success: false,
    message: 'You do not have access to the admin panel',
  });
};
