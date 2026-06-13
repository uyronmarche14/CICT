import { Router } from 'express';
import * as roleController from '../controllers/role.controller';
import { authenticate } from '../middleware/auth';
import { authorize, authorizeAnyGlobalOrScoped } from '../middleware/permissions';
import { logActivity } from '../middleware/activityLogger';
import { validate } from '../middleware/validate';
import { Permission } from '../types';
import { createRoleValidator, updateRoleValidator } from '../validators/role.validator';

const router: Router = Router();

/**
 * @route   POST /api/roles
 * @desc    Create new role
 * @access  Private (requires CREATE_ROLE permission)
 */
router.post(
  '/',
  authenticate,
  authorize(Permission.CREATE_ROLE),
  validate(createRoleValidator),
  logActivity('create', 'role'),
  roleController.createRole
);

/**
 * @route   GET /api/roles
 * @desc    Get all roles
 * @access  Private (requires role viewing, role assignment, or organization-admin management permission)
 */
router.get(
  '/',
  authenticate,
  authorizeAnyGlobalOrScoped(Permission.VIEW_ROLE, Permission.ASSIGN_ROLE, Permission.MANAGE_ORG_ADMINS),
  roleController.getAllRoles
);

/**
 * @route   GET /api/roles/:id
 * @desc    Get role by ID
 * @access  Private (requires VIEW_ROLE permission)
 */
router.get(
  '/:id',
  authenticate,
  authorize(Permission.VIEW_ROLE),
  roleController.getRoleById
);

/**
 * @route   PUT /api/roles/:id
 * @desc    Update role
 * @access  Private (requires EDIT_ROLE permission)
 */
router.put(
  '/:id',
  authenticate,
  authorize(Permission.EDIT_ROLE),
  validate(updateRoleValidator),
  logActivity('update', 'role'),
  roleController.updateRole
);

/**
 * @route   DELETE /api/roles/:id
 * @desc    Delete role
 * @access  Private (requires DELETE_ROLE permission)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(Permission.DELETE_ROLE),
  logActivity('delete', 'role'),
  roleController.deleteRole
);

export default router;
