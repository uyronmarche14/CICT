import { Types } from 'mongoose';
import Announcement from '../models/Announcement';
import Event from '../models/Event';
import News from '../models/News';
import Organization from '../models/Organization';
import Student from '../models/Student';
import SystemConfig from '../models/SystemConfig';
import User from '../models/User';
import { DEFAULT_SETTINGS } from '../config/settings';
import { AppError } from '../middleware/errorHandler';
import { sanitizeSearchInput } from '../utils/escapeRegex';

export interface LookupQuery {
  search?: unknown;
  limit?: unknown;
  excludeOrgId?: unknown;
  activeOnly?: unknown;
  orgId?: unknown;
  type?: unknown;
}

const parseLimit = (value: unknown): number => {
  const limit = Number(value ?? 20);
  if (!Number.isFinite(limit)) {
    return 20;
  }
  return Math.max(1, Math.min(50, limit));
};

const normalizeString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;

const splitReferenceItems = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value ?? '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const serializeGroup = (key: string, value: unknown) => {
  const items = splitReferenceItems(value).map((item) => ({
    id: item,
    label: item,
    value: item,
    status: 'active',
  }));

  return {
    key,
    items,
    total: items.length,
    activeCount: items.length,
    inactiveCount: 0,
    suggested: items.slice(0, 5),
  };
};

export const getOrganizationLookup = async (query: LookupQuery) => {
  const limit = parseLimit(query.limit);
  const safeSearch = sanitizeSearchInput(query.search);
  const filter: Record<string, any> = {};
  const excludeOrgId = normalizeString(query.excludeOrgId);

  if (query.activeOnly !== 'false') {
    filter.isActive = true;
  }

  if (excludeOrgId) {
    filter.id = { $ne: excludeOrgId.toLowerCase() };
  }

  if (safeSearch) {
    filter.$or = [
      { id: { $regex: safeSearch, $options: 'i' } },
      { name: { $regex: safeSearch, $options: 'i' } },
      { fullName: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  const [organizations, total, activeCount] = await Promise.all([
    Organization.find(filter).select('id name fullName organizationType logo isActive').sort({ name: 1 }).limit(limit).lean(),
    Organization.countDocuments(filter),
    Organization.countDocuments({ ...filter, isActive: true }),
  ]);

  const items = organizations.map((org) => ({
    id: org.id,
    label: org.name,
    value: org.id,
    description: org.fullName,
    status: org.isActive ? 'active' : 'inactive',
    badge: org.organizationType,
    imageUrl: org.logo,
  }));

  return {
    items,
    total,
    activeCount,
    inactiveCount: Math.max(total - activeCount, 0),
    suggested: items.slice(0, 5),
    source: 'organizations',
  };
};

export const getUserLookup = async (query: LookupQuery) => {
  const limit = parseLimit(query.limit);
  const safeSearch = sanitizeSearchInput(query.search);
  const filter: Record<string, any> = { isActive: true };

  if (safeSearch) {
    filter.$or = [
      { firstName: { $regex: safeSearch, $options: 'i' } },
      { lastName: { $regex: safeSearch, $options: 'i' } },
      { email: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).select('firstName lastName email role isActive').sort({ firstName: 1, lastName: 1 }).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  const items = users.map((user) => ({
    id: String(user._id),
    label: `${user.firstName} ${user.lastName}`,
    value: String(user._id),
    description: user.email,
    status: user.isActive ? 'active' : 'inactive',
    badge: user.role,
  }));

  return {
    items,
    total,
    activeCount: total,
    inactiveCount: 0,
    suggested: items.slice(0, 5),
    source: 'users',
  };
};

export const getStudentLookup = async (query: LookupQuery) => {
  const limit = parseLimit(query.limit);
  const safeSearch = sanitizeSearchInput(query.search);
  const filter: Record<string, any> = { isActive: true };

  if (safeSearch) {
    filter.$or = [
      { studentNumber: { $regex: safeSearch, $options: 'i' } },
      { email: { $regex: safeSearch, $options: 'i' } },
      { firstName: { $regex: safeSearch, $options: 'i' } },
      { lastName: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  const [students, total] = await Promise.all([
    Student.find(filter)
      .select('studentNumber firstName lastName email status programId yearLevelId')
      .populate('programId', 'code')
      .populate('yearLevelId', 'label')
      .sort({ studentNumber: 1 })
      .limit(limit)
      .lean(),
    Student.countDocuments(filter),
  ]);

  const items = students.map((student) => ({
    id: String(student._id),
    label: `${student.studentNumber} - ${student.firstName} ${student.lastName}`,
    value: String(student._id),
    description: student.email,
    status: student.status,
  }));

  return {
    items,
    total,
    activeCount: total,
    inactiveCount: 0,
    suggested: items.slice(0, 5),
    source: 'students',
  };
};

export const getContentLookup = async (query: LookupQuery) => {
  const type = normalizeString(query.type);
  const limit = parseLimit(query.limit);
  const safeSearch = sanitizeSearchInput(query.search);
  const orgId = normalizeString(query.orgId);
  const filter: Record<string, any> = {};

  if (safeSearch) {
    filter.title = { $regex: safeSearch, $options: 'i' };
  }

  if (orgId) {
    filter.organizationId = orgId.toLowerCase();
  }

  const model: any =
    type === 'news' ? News :
    type === 'announcement' ? Announcement :
    type === 'event' ? Event :
    null;

  if (!model) {
    return {
      items: [],
      total: 0,
      activeCount: 0,
      inactiveCount: 0,
      suggested: [],
      source: 'content',
    };
  }

  const [records, total] = await Promise.all([
    model.find(filter).select('title excerpt status ownerType organizationId startDate createdAt').sort({ createdAt: -1 }).limit(limit).lean(),
    model.countDocuments(filter),
  ]);

  const items = records.map((record: any) => ({
    id: String(record._id),
    label: record.title,
    value: String(record._id),
    description: 'excerpt' in record ? record.excerpt : undefined,
    status: 'status' in record ? record.status : undefined,
    badge: record.organizationId || record.ownerType,
  }));

  return {
    items,
    total,
    activeCount: total,
    inactiveCount: 0,
    suggested: items.slice(0, 5),
    source: type,
  };
};

export const getReferenceDataLookup = async () => {
  const defaults = DEFAULT_SETTINGS.referenceData as Record<string, unknown>;
  const doc = await SystemConfig.findOne({ group: 'referenceData' }).select('value').lean();
  const value = { ...defaults, ...((doc?.value as Record<string, unknown>) ?? {}) };

  const groups = Object.fromEntries(
    Object.entries(value).map(([key, groupValue]) => [key, serializeGroup(key, groupValue)])
  );

  return { groups };
};

export const ensureOrganizationsExist = async (ids: string[], message = 'Organization not found') => {
  const normalizedIds = [...new Set(ids.map((id) => id.trim().toLowerCase()).filter(Boolean))];
  if (normalizedIds.length === 0) {
    return normalizedIds;
  }

  const count = await Organization.countDocuments({ id: { $in: normalizedIds } });
  if (count !== normalizedIds.length) {
    throw new AppError(message, 404);
  }

  return normalizedIds;
};

export const ensureUsersExist = async (ids: string[], message = 'Assigned user not found') => {
  const normalizedIds = [...new Set(ids.filter(Boolean))];
  if (normalizedIds.length === 0) {
    return normalizedIds;
  }

  const hasInvalidId = normalizedIds.some((id) => !Types.ObjectId.isValid(id));
  if (hasInvalidId) {
    throw new AppError(message, 400);
  }

  const count = await User.countDocuments({ _id: { $in: normalizedIds }, isActive: true });
  if (count !== normalizedIds.length) {
    throw new AppError(message, 404);
  }

  return normalizedIds;
};

export const ensureContentExists = async (type: string, id: string, orgId?: string) => {
  const model: any =
    type === 'news' ? News :
    type === 'announcement' ? Announcement :
    type === 'event' ? Event :
    null;

  if (!model || !Types.ObjectId.isValid(id)) {
    throw new AppError('Shared content not found', 404);
  }

  const filter: Record<string, unknown> = { _id: id };
  if (orgId) {
    filter.organizationId = orgId;
  }

  const exists = await model.exists(filter);
  if (!exists) {
    throw new AppError('Shared content not found or not owned by this organization', 404);
  }
};
