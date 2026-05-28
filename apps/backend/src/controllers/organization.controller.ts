import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getOrganizations as getOrganizationsService,
  getOrganization as getOrganizationService,
  getAdminOrganizations as getAdminOrganizationsService,
  getAdminOrganization as getAdminOrganizationService,
  getAdminOrganizationAssignments as getAdminOrganizationAssignmentsService,
  createOrganization as createOrganizationService,
  updateOrganization as updateOrganizationService,
  deleteOrganization as deleteOrganizationService,
  addMember as addMemberService,
  updateMember as updateMemberService,
  deleteMember as deleteMemberService,
  uploadImage as uploadImageService,
} from '../services/organization.service';

export const getOrganizations = async (_req: Request, res: Response) => {
  const data = await getOrganizationsService();
  res.status(200).json({ success: true, data });
};

export const getOrganization = async (req: Request, res: Response) => {
  const data = await getOrganizationService(req.params.id as string);
  res.status(200).json({ success: true, data });
};

export const getAdminOrganizations = async (req: AuthRequest, res: Response) => {
  const data = await getAdminOrganizationsService(req);
  res.status(200).json({ success: true, data });
};

export const getAdminOrganization = async (req: AuthRequest, res: Response) => {
  const data = await getAdminOrganizationService(req, req.params.id);
  res.status(200).json({ success: true, data });
};

export const getAdminOrganizationAssignments = async (req: AuthRequest, res: Response) => {
  const assignments = await getAdminOrganizationAssignmentsService(req, req.params.id);
  res.status(200).json({ success: true, data: { assignments } });
};

export const createOrganization = async (req: AuthRequest, res: Response) => {
  const organization = await createOrganizationService(req);
  res.status(201).json({ success: true, data: organization });
};

export const updateOrganization = async (req: AuthRequest, res: Response) => {
  const data = await updateOrganizationService(req, req.params.id);
  res.status(200).json({ success: true, data });
};

export const deleteOrganization = async (req: AuthRequest, res: Response) => {
  await deleteOrganizationService(req, req.params.id);
  res.status(200).json({ success: true, message: 'Organization deleted successfully' });
};

export const addMember = async (req: AuthRequest, res: Response) => {
  const member = await addMemberService(req, req.params.id);
  res.status(201).json({ success: true, data: member });
};

export const updateMember = async (req: AuthRequest, res: Response) => {
  const { orgId, memberId } = req.params;
  const member = await updateMemberService(req, orgId, memberId);
  res.status(200).json({ success: true, data: member });
};

export const deleteMember = async (req: AuthRequest, res: Response) => {
  const { orgId, memberId } = req.params;
  await deleteMemberService(req, orgId, memberId);
  res.status(200).json({ success: true, message: 'Member removed', data: null });
};

export const uploadImage = async (req: AuthRequest, res: Response) => {
  const data = await uploadImageService(req);
  res.status(200).json({ success: true, data });
};
