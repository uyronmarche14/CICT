import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  createUser as createUserService,
  getAllUsers as getAllUsersService,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
  updateUserRole as updateUserRoleService,
  updateUserStatus as updateUserStatusService,
  deleteUser as deleteUserService,
} from '../services/user.service';

/**
 * Create a new admin CMS user
 */
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const serializedUser = await createUserService(req);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: { user: serializedUser },
  });
};

/**
 * Get all users
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  const result = await getAllUsersService(req);

  res.status(200).json({
    success: true,
    data: result,
  });
};

/**
 * Get user by ID
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const user = await getUserByIdService(id);

  res.status(200).json({
    success: true,
    data: { user },
  });
};

/**
 * Update non-privileged user account fields
 */
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = await updateUserService(id, req);

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: { user },
  });
};

/**
 * Update a user's system role/custom role
 */
export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = await updateUserRoleService(id, req);

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    data: { user },
  });
};

/**
 * Activate/deactivate a user
 */
export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = await updateUserStatusService(id, req);

  res.status(200).json({
    success: true,
    message: `User ${req.body.isActive ? 'activated' : 'deactivated'} successfully`,
    data: { user },
  });
};

/**
 * Delete user
 */
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await deleteUserService(id, req);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
};
