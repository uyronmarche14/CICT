import { Model, Types } from 'mongoose';
import Announcement from '../models/Announcement';
import Event from '../models/Event';
import News from '../models/News';
import OrgMeeting from '../models/OrgMeeting';
import OrgTask from '../models/OrgTask';
import OrgTemplate from '../models/OrgTemplate';
import Organization from '../models/Organization';
import OrganizationMember from '../models/OrganizationMember';
import ProcessTemplate from '../models/ProcessTemplate';
import Program from '../models/Program';
import Role from '../models/Role';
import Section from '../models/Section';
import Student from '../models/Student';
import SystemConfig from '../models/SystemConfig';
import User from '../models/User';
import YearLevel from '../models/YearLevel';
import { DEFAULT_SETTINGS } from '../config/settings';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { ContentOwnerType, Permission } from '../types';
import { sanitizeSearchInput } from '../utils/escapeRegex';
import { hasAnyGlobalPermission, hasGlobalPermission } from '../utils/rbac';
import {
  canAccessOrganizationScope,
  getAccessibleOrganizationIdsForAuthenticatedUser,
} from '../utils/organizationScope';

export type LookupKind =
  | 'organizations'
  | 'users'
  | 'students'
  | 'org-members'
  | 'org-officers'
  | 'roles'
  | 'programs'
  | 'year-levels'
  | 'sections'
  | 'news'
  | 'announcements'
  | 'events'
  | 'tasks'
  | 'meetings'
  | 'process-templates'
  | 'org-templates'
  | 'content';

export interface LookupQuery {
  search?: unknown;
  limit?: unknown;
  excludeOrgId?: unknown;
  activeOnly?: unknown;
  orgId?: unknown;
  type?: unknown;
  status?: unknown;
  ownerType?: unknown;
  ids?: unknown;
  programId?: unknown;
  yearLevelId?: unknown;
}

export interface LookupItem {
  id: string;
  label: string;
  value: string;
  description?: string;
  status?: string;
  badge?: string;
  imageUrl?: string;
  meta?: Record<string, unknown>;
}

export interface LookupResponse {
  items: LookupItem[];
  total: number;
  activeCount: number;
  inactiveCount: number;
  suggested: LookupItem[];
  source: string;
}

interface LookupContext {
  req: AuthRequest;
  query: LookupQuery;
  limit: number;
  search: string;
  ids: string[];
}

type LookupResolver = (context: LookupContext) => Promise<LookupResponse>;
type LookupFilter = Record<string, unknown>;
type LookupRecord = Record<string, unknown> & { _id?: unknown };
type LookupModel = Model<unknown>;

interface ResolvedContentModel {
  model: LookupModel;
  source: string;
  permission: Permission;
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

const asLookupRecord = (value: unknown): LookupRecord => value as LookupRecord;

const fieldToString = (record: LookupRecord, field: string): string | undefined => {
  const value = record[field];
  if (value === undefined || value === null) {
    return undefined;
  }
  return typeof value === 'string' ? value : String(value);
};

const fieldToBoolean = (record: LookupRecord, field: string): boolean =>
  record[field] === true;

const fieldToArray = (record: LookupRecord, field: string): unknown[] =>
  Array.isArray(record[field]) ? record[field] : [];

const parseIds = (value: unknown): string[] => {
  const raw = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
  return [...new Set(raw.map((id) => String(id).trim()).filter(Boolean))];
};

const objectIdFilter = (ids: string[]) => {
  const validIds = ids.filter((id) => Types.ObjectId.isValid(id));
  return validIds.length > 0 ? { _id: { $in: validIds } } : { _id: null };
};

const splitReferenceItems = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value ?? '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeReferenceKey = (value: string): string => value.trim().toLowerCase();

const serializeGroup = (key: string, value: unknown) => {
  const seen = new Set<string>();
  const items = splitReferenceItems(value)
    .filter((item) => {
      const normalized = normalizeReferenceKey(item);
      if (seen.has(normalized)) {
        return false;
      }
      seen.add(normalized);
      return true;
    })
    .map((item) => ({
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

const makeResponse = (source: string, items: LookupItem[], total = items.length): LookupResponse => {
  const activeCount = items.filter((item) => item.status !== 'inactive').length;
  return {
    items,
    total,
    activeCount,
    inactiveCount: Math.max(total - activeCount, 0),
    suggested: items.slice(0, 5),
    source,
  };
};

const requireGlobalAny = (req: AuthRequest, permissions: Permission[], message = 'Lookup access denied') => {
  if (!req.user || !hasAnyGlobalPermission(req.user, permissions)) {
    throw new AppError(message, 403);
  }
};

const getScopedOrgId = (query: LookupQuery): string => {
  const orgId = normalizeString(query.orgId)?.toLowerCase();
  if (!orgId) {
    throw new AppError('orgId is required for this lookup', 400);
  }
  return orgId;
};

const ensureOrgScope = async (req: AuthRequest, orgId: string, permission: Permission) => {
  if (!req.user || !canAccessOrganizationScope(req.user, orgId, permission)) {
    throw new AppError('Lookup access denied for this organization', 403);
  }
  const org = await Organization.findOne({ id: orgId }).select('_id id name').lean();
  if (!org) {
    throw new AppError('Organization not found', 404);
  }
  return org;
};

const buildOrgVisibilityFilter = (req: AuthRequest, permission = Permission.VIEW_ORGANIZATION) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }
  if (hasGlobalPermission(req.user, permission)) {
    return {};
  }
  const scopedIds = getAccessibleOrganizationIdsForAuthenticatedUser(req.user);
  return scopedIds.length > 0 ? { id: { $in: scopedIds } } : { _id: null };
};

const applyStringSearch = (
  filter: Record<string, unknown>,
  search: string,
  fields: string[]
): Record<string, unknown> => {
  if (!search) {
    return filter;
  }
  return {
    ...filter,
    $or: fields.map((field) => ({ [field]: { $regex: search, $options: 'i' } })),
  };
};

const resolveContentModel = (type: string): ResolvedContentModel | null => {
  if (type === 'news') {
    return { model: News as unknown as LookupModel, source: 'news', permission: Permission.VIEW_NEWS };
  }
  if (type === 'announcement' || type === 'announcements') {
    return { model: Announcement as unknown as LookupModel, source: 'announcements', permission: Permission.VIEW_ANNOUNCEMENT };
  }
  if (type === 'event' || type === 'events') {
    return { model: Event as unknown as LookupModel, source: 'events', permission: Permission.VIEW_EVENT };
  }
  return null;
};

const buildContentScopeFilter = (req: AuthRequest, permission: Permission, query: LookupQuery) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const ownerType = normalizeString(query.ownerType);
  const orgId = normalizeString(query.orgId)?.toLowerCase();
  const filter: Record<string, unknown> = {};

  if (normalizeString(query.status)) {
    filter.status = normalizeString(query.status);
  }
  if (ownerType === ContentOwnerType.SYSTEM || ownerType === ContentOwnerType.ORGANIZATION) {
    filter.ownerType = ownerType;
  }

  if (hasGlobalPermission(req.user, permission)) {
    if (orgId) {
      filter.organizationId = orgId;
    }
    return filter;
  }

  const scopedIds = getAccessibleOrganizationIdsForAuthenticatedUser(req.user, permission);
  if (scopedIds.length === 0 || ownerType === ContentOwnerType.SYSTEM) {
    return { _id: null };
  }

  const allowedIds = orgId ? scopedIds.filter((id) => id === orgId) : scopedIds;
  return allowedIds.length > 0
    ? { ...filter, ownerType: ContentOwnerType.ORGANIZATION, organizationId: { $in: allowedIds } }
    : { _id: null };
};

const genericObjectIdLookup = async <T>(
  model: Model<T>,
  source: string,
  context: LookupContext,
  options: {
    baseFilter?: LookupFilter;
    searchFields: string[];
    select: string;
    sort?: Record<string, 1 | -1>;
    map: (record: LookupRecord) => LookupItem;
  }
) => {
  const filter = context.ids.length > 0
    ? { ...(options.baseFilter ?? {}), ...objectIdFilter(context.ids) }
    : applyStringSearch(options.baseFilter ?? {}, context.search, options.searchFields);

  const [records, total] = await Promise.all([
    model.find(filter).select(options.select).sort(options.sort ?? {}).limit(context.limit).lean(),
    model.countDocuments(filter),
  ]);

  return makeResponse(source, records.map((record) => options.map(asLookupRecord(record))), total);
};

const lookupOrganizations: LookupResolver = async (context) => {
  const excludeOrgId = normalizeString(context.query.excludeOrgId)?.toLowerCase();
  const filter: Record<string, unknown> = {
    ...buildOrgVisibilityFilter(context.req),
  };

  if (context.query.activeOnly !== 'false') {
    filter.isActive = true;
  }
  if (excludeOrgId) {
    filter.id = { ...(typeof filter.id === 'object' ? filter.id as Record<string, unknown> : {}), $ne: excludeOrgId };
  }
  if (context.ids.length > 0) {
    filter.id = { $in: context.ids.map((id) => id.toLowerCase()) };
  }

  const searchFilter = context.ids.length > 0
    ? filter
    : applyStringSearch(filter, context.search, ['id', 'name', 'fullName']);

  const [organizations, total, activeCount] = await Promise.all([
    Organization.find(searchFilter).select('id name fullName organizationType logo isActive').sort({ name: 1 }).limit(context.limit).lean(),
    Organization.countDocuments(searchFilter),
    Organization.countDocuments({ ...searchFilter, isActive: true }),
  ]);

  return {
    ...makeResponse('organizations', organizations.map((org) => ({
      id: org.id,
      label: org.name,
      value: org.id,
      description: org.fullName,
      status: org.isActive ? 'active' : 'inactive',
      badge: org.organizationType,
      imageUrl: org.logo,
    })), total),
    activeCount,
    inactiveCount: Math.max(total - activeCount, 0),
  };
};

const lookupUsers: LookupResolver = async (context) => {
  requireGlobalAny(context.req, [Permission.VIEW_USERS, Permission.CREATE_USER, Permission.EDIT_USER, Permission.ASSIGN_ROLE]);
  return genericObjectIdLookup(User, 'users', context, {
    baseFilter: { isActive: true },
    searchFields: ['firstName', 'lastName', 'email'],
    select: 'firstName lastName email role isActive',
    sort: { firstName: 1, lastName: 1 },
    map: (user) => ({
      id: String(user._id),
      label: `${fieldToString(user, 'firstName') ?? ''} ${fieldToString(user, 'lastName') ?? ''}`.trim(),
      value: String(user._id),
      description: fieldToString(user, 'email'),
      status: fieldToBoolean(user, 'isActive') ? 'active' : 'inactive',
      badge: fieldToString(user, 'role'),
    }),
  });
};

const lookupStudents: LookupResolver = async (context) => {
  requireGlobalAny(context.req, [Permission.VIEW_STUDENT, Permission.CREATE_STUDENT, Permission.EDIT_STUDENT, Permission.MANAGE_MEMBER_ROLES]);
  return genericObjectIdLookup(Student, 'students', context, {
    baseFilter: context.query.activeOnly === 'false' ? {} : { isActive: true },
    searchFields: ['studentNumber', 'email', 'firstName', 'lastName'],
    select: 'studentNumber firstName lastName email status programId yearLevelId sectionId isActive',
    sort: { studentNumber: 1 },
    map: (student) => ({
      id: String(student._id),
      label: `${fieldToString(student, 'studentNumber') ?? ''} - ${fieldToString(student, 'firstName') ?? ''} ${fieldToString(student, 'lastName') ?? ''}`.trim(),
      value: String(student._id),
      description: fieldToString(student, 'email'),
      status: fieldToString(student, 'status'),
    }),
  });
};

const lookupRoles: LookupResolver = async (context) => {
  requireGlobalAny(context.req, [Permission.VIEW_ROLE, Permission.ASSIGN_ROLE, Permission.CREATE_ROLE, Permission.EDIT_ROLE]);
  return genericObjectIdLookup(Role, 'roles', context, {
    searchFields: ['name', 'description'],
    select: 'name description isSystemRole permissions',
    sort: { name: 1 },
    map: (role) => ({
      id: String(role._id),
      label: fieldToString(role, 'name') ?? String(role._id),
      value: String(role._id),
      description: fieldToString(role, 'description'),
      badge: fieldToBoolean(role, 'isSystemRole') ? 'system' : 'custom',
      meta: { permissionCount: fieldToArray(role, 'permissions').length },
    }),
  });
};

const lookupPrograms: LookupResolver = async (context) => {
  requireGlobalAny(context.req, [Permission.VIEW_ACADEMIC_GROUPS, Permission.MANAGE_ACADEMIC_GROUPS]);
  return genericObjectIdLookup(Program, 'programs', context, {
    baseFilter: context.query.activeOnly === 'false' ? {} : { isActive: true },
    searchFields: ['code', 'name'],
    select: 'code name isActive',
    sort: { sortOrder: 1, code: 1 },
    map: (program) => ({
      id: String(program._id),
      label: `${fieldToString(program, 'code') ?? ''} - ${fieldToString(program, 'name') ?? ''}`.trim(),
      value: String(program._id),
      description: fieldToString(program, 'name'),
      status: fieldToBoolean(program, 'isActive') ? 'active' : 'inactive',
      badge: fieldToString(program, 'code'),
    }),
  });
};

const lookupYearLevels: LookupResolver = async (context) => {
  requireGlobalAny(context.req, [Permission.VIEW_ACADEMIC_GROUPS, Permission.MANAGE_ACADEMIC_GROUPS]);
  return genericObjectIdLookup(YearLevel, 'year-levels', context, {
    baseFilter: context.query.activeOnly === 'false' ? {} : { isActive: true },
    searchFields: ['code', 'label'],
    select: 'code label numericLevel isActive',
    sort: { sortOrder: 1, numericLevel: 1 },
    map: (yearLevel) => ({
      id: String(yearLevel._id),
      label: fieldToString(yearLevel, 'label') ?? String(yearLevel._id),
      value: String(yearLevel._id),
      description: fieldToString(yearLevel, 'code'),
      status: fieldToBoolean(yearLevel, 'isActive') ? 'active' : 'inactive',
    }),
  });
};

const lookupSections: LookupResolver = async (context) => {
  requireGlobalAny(context.req, [Permission.VIEW_ACADEMIC_GROUPS, Permission.MANAGE_ACADEMIC_GROUPS]);
  const baseFilter: Record<string, unknown> = context.query.activeOnly === 'false' ? {} : { isActive: true };
  const programId = normalizeString(context.query.programId);
  const yearLevelId = normalizeString(context.query.yearLevelId);
  if (programId && Types.ObjectId.isValid(programId)) {
    baseFilter.programId = programId;
  }
  if (yearLevelId && Types.ObjectId.isValid(yearLevelId)) {
    baseFilter.yearLevelId = yearLevelId;
  }

  const filter = context.ids.length > 0
    ? { ...baseFilter, ...objectIdFilter(context.ids) }
    : applyStringSearch(baseFilter, context.search, ['name', 'displayName']);

  const [sections, total] = await Promise.all([
    Section.find(filter)
      .select('name displayName isActive programId yearLevelId')
      .populate('programId', 'code')
      .populate('yearLevelId', 'label')
      .sort({ displayName: 1 })
      .limit(context.limit)
      .lean(),
    Section.countDocuments(filter),
  ]);

  return makeResponse('sections', sections.map((section) => {
    const record = asLookupRecord(section);
    const program = asLookupRecord(record.programId ?? {});
    const yearLevel = asLookupRecord(record.yearLevelId ?? {});

    return {
      id: String(record._id),
      label: fieldToString(record, 'displayName') ?? fieldToString(record, 'name') ?? String(record._id),
      value: String(record._id),
      description: [fieldToString(program, 'code'), fieldToString(yearLevel, 'label')].filter(Boolean).join(' · '),
      status: fieldToBoolean(record, 'isActive') ? 'active' : 'inactive',
    };
  }), total);
};

const lookupMembers = (officersOnly: boolean): LookupResolver => async (context) => {
  const orgId = getScopedOrgId(context.query);
  const org = await ensureOrgScope(context.req, orgId, Permission.VIEW_MEMBER);
  const baseFilter: Record<string, unknown> = { organizationId: org._id };
  if (context.query.activeOnly !== 'false') {
    baseFilter.status = 'active';
  }
  if (officersOnly) {
    baseFilter.memberType = { $in: ['officer', 'advisor'] };
  }
  const filter = context.ids.length > 0
    ? { ...baseFilter, ...objectIdFilter(context.ids) }
    : applyStringSearch(baseFilter, context.search, ['name', 'position', 'personalEmail']);

  const [members, total] = await Promise.all([
    OrganizationMember.find(filter).select('name position status memberType photo personalEmail').sort({ sortOrder: 1, name: 1 }).limit(context.limit).lean(),
    OrganizationMember.countDocuments(filter),
  ]);

  return makeResponse(officersOnly ? 'org-officers' : 'org-members', members.map((member) => ({
    id: String(member._id),
    label: member.name,
    value: String(member._id),
    description: member.position,
    status: member.status,
    badge: member.memberType,
    imageUrl: member.photo,
  })), total);
};

const lookupContentByType = (type: string): LookupResolver => async (context) => {
  const resolved = resolveContentModel(type);
  if (!resolved) {
    throw new AppError('Invalid content lookup type', 400);
  }
  const baseFilter = buildContentScopeFilter(context.req, resolved.permission, context.query);
  const filter = context.ids.length > 0
    ? { ...baseFilter, ...objectIdFilter(context.ids) }
    : applyStringSearch(baseFilter, context.search, ['title', 'excerpt']);

  const [records, total] = await Promise.all([
    resolved.model.find(filter).select('title excerpt status ownerType organizationId startDate createdAt').sort({ createdAt: -1 }).limit(context.limit).lean(),
    resolved.model.countDocuments(filter),
  ]);

  return makeResponse(resolved.source, records.map((record) => {
    const item = asLookupRecord(record);
    const organizationId = fieldToString(item, 'organizationId');
    const ownerType = fieldToString(item, 'ownerType');

    return {
      id: String(item._id),
      label: fieldToString(item, 'title') ?? String(item._id),
      value: String(item._id),
      description: fieldToString(item, 'excerpt'),
      status: fieldToString(item, 'status'),
      badge: organizationId ?? ownerType,
      meta: { ownerType, organizationId, startDate: item.startDate },
    };
  }), total);
};

const lookupContent: LookupResolver = async (context) => {
  const type = normalizeString(context.query.type);
  if (!type) {
    throw new AppError('type is required for content lookup', 400);
  }
  return lookupContentByType(type)(context);
};

const lookupTasks: LookupResolver = async (context) => {
  const orgId = getScopedOrgId(context.query);
  const org = await ensureOrgScope(context.req, orgId, Permission.MANAGE_ORG_TASKS);
  return genericObjectIdLookup(OrgTask, 'tasks', context, {
    baseFilter: { organizationId: org._id },
    searchFields: ['title', 'description', 'category'],
    select: 'title description status priority category dueDate',
    sort: { createdAt: -1 },
    map: (task) => ({
      id: String(task._id),
      label: fieldToString(task, 'title') ?? String(task._id),
      value: String(task._id),
      description: fieldToString(task, 'description'),
      status: fieldToString(task, 'status'),
      badge: fieldToString(task, 'priority') ?? fieldToString(task, 'category'),
    }),
  });
};

const lookupMeetings: LookupResolver = async (context) => {
  const orgId = getScopedOrgId(context.query);
  const org = await ensureOrgScope(context.req, orgId, Permission.MANAGE_ORG_MEETINGS);
  return genericObjectIdLookup(OrgMeeting, 'meetings', context, {
    baseFilter: { organizationId: org._id },
    searchFields: ['title', 'description', 'location'],
    select: 'title description date location',
    sort: { date: -1 },
    map: (meeting) => ({
      id: String(meeting._id),
      label: fieldToString(meeting, 'title') ?? String(meeting._id),
      value: String(meeting._id),
      description: fieldToString(meeting, 'location'),
      meta: { date: meeting.date },
    }),
  });
};

const lookupProcessTemplates: LookupResolver = async (context) => {
  requireGlobalAny(context.req, [Permission.VIEW_PROCESS, Permission.CREATE_PROCESS, Permission.EDIT_PROCESS]);
  return genericObjectIdLookup(ProcessTemplate, 'process-templates', context, {
    baseFilter: context.query.activeOnly === 'false' ? {} : { isActive: true },
    searchFields: ['title', 'description', 'processType'],
    select: 'title description processType organizationScope isActive',
    sort: { updatedAt: -1 },
    map: (template) => ({
      id: String(template._id),
      label: fieldToString(template, 'title') ?? String(template._id),
      value: String(template._id),
      description: fieldToString(template, 'description'),
      status: fieldToBoolean(template, 'isActive') ? 'active' : 'inactive',
      badge: fieldToString(template, 'processType'),
      meta: { organizationScope: template.organizationScope },
    }),
  });
};

const lookupOrgTemplates: LookupResolver = async (context) => {
  requireGlobalAny(context.req, [Permission.MANAGE_ORG_TEMPLATES]);
  return genericObjectIdLookup(OrgTemplate, 'org-templates', context, {
    baseFilter: context.query.activeOnly === 'false' ? {} : { isActive: true },
    searchFields: ['name', 'description'],
    select: 'name description isActive',
    sort: { name: 1 },
    map: (template) => ({
      id: String(template._id),
      label: fieldToString(template, 'name') ?? String(template._id),
      value: String(template._id),
      description: fieldToString(template, 'description'),
      status: fieldToBoolean(template, 'isActive') ? 'active' : 'inactive',
    }),
  });
};

const registry: Record<LookupKind, LookupResolver> = {
  organizations: lookupOrganizations,
  users: lookupUsers,
  students: lookupStudents,
  'org-members': lookupMembers(false),
  'org-officers': lookupMembers(true),
  roles: lookupRoles,
  programs: lookupPrograms,
  'year-levels': lookupYearLevels,
  sections: lookupSections,
  news: lookupContentByType('news'),
  announcements: lookupContentByType('announcements'),
  events: lookupContentByType('events'),
  tasks: lookupTasks,
  meetings: lookupMeetings,
  'process-templates': lookupProcessTemplates,
  'org-templates': lookupOrgTemplates,
  content: lookupContent,
};

export const getLookup = async (req: AuthRequest, kind: string): Promise<LookupResponse> => {
  const resolver = registry[kind as LookupKind];
  if (!resolver) {
    throw new AppError('Invalid lookup kind', 400);
  }
  const query = req.query as LookupQuery;
  return resolver({
    req,
    query,
    limit: parseLimit(query.limit),
    search: sanitizeSearchInput(query.search) ?? '',
    ids: parseIds(query.ids),
  });
};

const buildLegacyLookupRequest = (query: LookupQuery, permissions: Permission[]) => ({
  query,
  user: { permissions, organizationAssignments: [] },
} as unknown as AuthRequest);

export const getOrganizationLookup = async (query: LookupQuery) =>
  lookupOrganizations({
    req: buildLegacyLookupRequest(query, [Permission.VIEW_ORGANIZATION]),
    query,
    limit: parseLimit(query.limit),
    search: sanitizeSearchInput(query.search) ?? '',
    ids: parseIds(query.ids),
  });

export const getUserLookup = async (query: LookupQuery) =>
  lookupUsers({
    req: buildLegacyLookupRequest(query, [Permission.VIEW_USERS]),
    query,
    limit: parseLimit(query.limit),
    search: sanitizeSearchInput(query.search) ?? '',
    ids: parseIds(query.ids),
  });

export const getStudentLookup = async (query: LookupQuery) =>
  lookupStudents({
    req: buildLegacyLookupRequest(query, [Permission.VIEW_STUDENT]),
    query,
    limit: parseLimit(query.limit),
    search: sanitizeSearchInput(query.search) ?? '',
    ids: parseIds(query.ids),
  });

export const getContentLookup = async (query: LookupQuery) =>
  lookupContent({
    req: buildLegacyLookupRequest(query, [
      Permission.VIEW_NEWS,
      Permission.VIEW_ANNOUNCEMENT,
      Permission.VIEW_EVENT,
    ]),
    query,
    limit: parseLimit(query.limit),
    search: sanitizeSearchInput(query.search) ?? '',
    ids: parseIds(query.ids),
  });

export const getReferenceDataLookup = async () => {
  const defaults = DEFAULT_SETTINGS.referenceData as Record<string, unknown>;
  const doc = await SystemConfig.findOne({ group: 'referenceData' }).select('value').lean();
  const value = { ...defaults, ...((doc?.value as Record<string, unknown>) ?? {}) };
  const groups = Object.fromEntries(
    Object.entries(value).map(([key, groupValue]) => [key, serializeGroup(key, groupValue)])
  );

  return { groups };
};

export const getReferenceValues = async (groupKey: string): Promise<string[]> => {
  const defaults = DEFAULT_SETTINGS.referenceData as Record<string, unknown>;
  const doc = await SystemConfig.findOne({ group: 'referenceData' }).select('value').lean();
  const configured = doc?.value as Record<string, unknown> | undefined;
  const value = configured?.[groupKey] ?? defaults[groupKey];
  return serializeGroup(groupKey, value).items.map((item) => item.value);
};

const normalizeStringIds = (ids: unknown[], message: string): string[] => {
  const normalizedIds = [...new Set(
    ids
      .map((id) => (typeof id === 'string' ? id.trim() : ''))
      .filter(Boolean)
  )];
  if (ids.some((id) => typeof id !== 'string')) {
    throw new AppError(message, 400);
  }
  return normalizedIds;
};

export const ensureOrganizationsExist = async (ids: unknown[], message = 'Organization not found') => {
  const normalizedIds = normalizeStringIds(ids, message).map((id) => id.toLowerCase());
  if (normalizedIds.length === 0) {
    return normalizedIds;
  }

  const count = await Organization.countDocuments({ id: { $in: normalizedIds } });
  if (count !== normalizedIds.length) {
    throw new AppError(message, 404);
  }

  return normalizedIds;
};

export const ensureUsersExist = async (ids: unknown[], message = 'Assigned user not found') => {
  const normalizedIds = normalizeStringIds(ids, message);
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

export const ensureStudentsExist = async (ids: unknown[], message = 'Student not found') => {
  const normalizedIds = normalizeStringIds(ids, message);
  if (normalizedIds.length === 0) {
    return normalizedIds;
  }
  if (normalizedIds.some((id) => !Types.ObjectId.isValid(id))) {
    throw new AppError(message, 400);
  }
  const count = await Student.countDocuments({ _id: { $in: normalizedIds }, isActive: true });
  if (count !== normalizedIds.length) {
    throw new AppError(message, 404);
  }
  return normalizedIds;
};

export const ensureRolesExist = async (ids: unknown[], message = 'Role not found') => {
  const normalizedIds = normalizeStringIds(ids, message);
  if (normalizedIds.length === 0) {
    return normalizedIds;
  }
  if (normalizedIds.some((id) => !Types.ObjectId.isValid(id))) {
    throw new AppError(message, 400);
  }
  const count = await Role.countDocuments({ _id: { $in: normalizedIds } });
  if (count !== normalizedIds.length) {
    throw new AppError(message, 404);
  }
  return normalizedIds;
};

export const ensureReferenceValuesAllowed = async (
  groupKey: string,
  values: unknown[],
  message = 'Invalid reference data value'
) => {
  const normalizedValues = normalizeStringIds(values, message);
  if (normalizedValues.length === 0) {
    return normalizedValues;
  }
  const allowed = new Set((await getReferenceValues(groupKey)).map(normalizeReferenceKey));
  const invalidValue = normalizedValues.find((value) => !allowed.has(normalizeReferenceKey(value)));
  if (invalidValue) {
    throw new AppError(message, 400);
  }
  return normalizedValues;
};

export const ensureContentExists = async (type: string, id: string, orgId?: string) => {
  const resolved = resolveContentModel(type);

  if (!resolved || !Types.ObjectId.isValid(id)) {
    throw new AppError('Shared content not found', 404);
  }

  const filter: Record<string, unknown> = { _id: id };
  if (orgId) {
    filter.organizationId = orgId;
  }

  const exists = await resolved.model.exists(filter);
  if (!exists) {
    throw new AppError('Shared content not found or not owned by this organization', 404);
  }
};
