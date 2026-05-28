import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getAllRoles as getAllRolesService,
  getRoleById as getRoleByIdService,
  createRole as createRoleService,
  updateRole as updateRoleService,
  deleteRole as deleteRoleService,
} from '../services/role.service';

/**
 * Create new role
 */
export const createRole = async (req: AuthRequest, res: Response): Promise<void> => {
  const serializedRole = await createRoleService(req);

  res.status(201).json({
    success: true,
    message: 'Role created successfully',
    data: { role: serializedRole },
  });
};

/**
 * Get all roles
 */
export const getAllRoles = async (_req: AuthRequest, res: Response): Promise<void> => {
  const roles = await getAllRolesService();

  res.status(200).json({
    success: true,
    data: { roles },
  });
};

/**
 * Get role by ID
 */
export const getRoleById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const role = await getRoleByIdService(id);

  res.status(200).json({
    success: true,
    data: { role },
  });
};

/**
 * Update role
 */
export const updateRole = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const role = await updateRoleService(id, req);

  res.status(200).json({
    success: true,
    message: 'Role updated successfully',
    data: { role },
  });
};

/**
 * Delete role
 */
export const deleteRole = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await deleteRoleService(id, req);

  res.status(200).json({
    success: true,
    message: 'Role deleted successfully',
  });
};
