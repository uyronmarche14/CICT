import { Response } from 'express';
import Event from '../models/Event';
import News from '../models/News';
import Announcement from '../models/Announcement';
import ContentApprovalAction from '../models/ContentApprovalAction';
import { AuthRequest } from '../middleware/auth';
import { getAccessibleOrganizationIdsForAuthenticatedUser } from '../utils/organizationScope';
import { hasGlobalPermission } from '../utils/rbac';
import { ContentOwnerType, Permission } from '../types';

export const getPendingApprovals = async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const type = (req.query.type as string) || 'all';
  const skip = (page - 1) * limit;

  const user = req.user!;
  const isGlobalApprover = hasGlobalPermission(user, Permission.APPROVE_CONTENT) || hasGlobalPermission(user, Permission.REJECT_CONTENT);
  const accessibleOrgIds = getAccessibleOrganizationIdsForAuthenticatedUser(user, Permission.APPROVE_CONTENT);
  const accessibleOrgIdsForReject = getAccessibleOrganizationIdsForAuthenticatedUser(user, Permission.REJECT_CONTENT);
  const allAccessibleOrgIds = [...new Set([...accessibleOrgIds, ...accessibleOrgIdsForReject])];

  const buildScopeFilter = (ownerTypeField: string, orgIdField: string): Record<string, unknown> => {
    if (isGlobalApprover) {return {};}
    if (allAccessibleOrgIds.length === 0) {return { [ownerTypeField]: ContentOwnerType.SYSTEM, [orgIdField]: { $exists: false } };}
    return {
      $or: [
        { [ownerTypeField]: ContentOwnerType.SYSTEM },
        { [ownerTypeField]: ContentOwnerType.ORGANIZATION, [orgIdField]: { $in: allAccessibleOrgIds } },
      ],
    };
  };

  const pendingStatus = 'pending_approval';

  const fetchItems = async () => {
    if (type !== 'all' && type !== 'events') {return { items: [], total: 0 };}
    const scopeFilter = buildScopeFilter('ownerType', 'organizationId');
    const [items, total] = await Promise.all([
      Event.find({ status: pendingStatus, ...scopeFilter })
        .select('title ownerType organizationId approvalSummary createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments({ status: pendingStatus, ...scopeFilter }),
    ]);
    return {
      items: items.map((i) => ({
        _id: i._id.toString(),
        contentType: 'event' as const,
        contentId: i._id.toString(),
        title: i.title,
        status: i.status,
        submittedAt: i.approvalSummary?.submittedAt?.toISOString() ?? i.createdAt.toISOString(),
        submittedBy: { _id: i.approvalSummary?.submittedBy ?? '', firstName: '', lastName: '' },
        organizationId: i.organizationId ?? null,
        ownerType: i.ownerType,
      })),
      total,
    };
  };

  const fetchNews = async () => {
    if (type !== 'all' && type !== 'news') {return { items: [], total: 0 };}
    const scopeFilter = buildScopeFilter('ownerType', 'organizationId');
    const [items, total] = await Promise.all([
      News.find({ status: pendingStatus, ...scopeFilter })
        .select('title ownerType organizationId approvalSummary createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      News.countDocuments({ status: pendingStatus, ...scopeFilter }),
    ]);
    return {
      items: items.map((i) => ({
        _id: i._id.toString(),
        contentType: 'news' as const,
        contentId: i._id.toString(),
        title: i.title,
        status: i.status,
        submittedAt: i.approvalSummary?.submittedAt?.toISOString() ?? i.createdAt.toISOString(),
        submittedBy: { _id: i.approvalSummary?.submittedBy ?? '', firstName: '', lastName: '' },
        organizationId: i.organizationId ?? null,
        ownerType: i.ownerType,
      })),
      total,
    };
  };

  const fetchAnnouncements = async () => {
    if (type !== 'all' && type !== 'announcements') {return { items: [], total: 0 };}
    const scopeFilter = buildScopeFilter('ownerType', 'organizationId');
    const [items, total] = await Promise.all([
      Announcement.find({ status: pendingStatus, ...scopeFilter })
        .select('title ownerType organizationId approvalSummary createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Announcement.countDocuments({ status: pendingStatus, ...scopeFilter }),
    ]);
    return {
      items: items.map((i) => ({
        _id: i._id.toString(),
        contentType: 'announcement' as const,
        contentId: i._id.toString(),
        title: i.title,
        status: i.status,
        submittedAt: i.approvalSummary?.submittedAt?.toISOString() ?? i.createdAt.toISOString(),
        submittedBy: { _id: i.approvalSummary?.submittedBy ?? '', firstName: '', lastName: '' },
        organizationId: i.organizationId ?? null,
        ownerType: i.ownerType,
      })),
      total,
    };
  };

  const [events, news, announcements] = await Promise.all([
    fetchItems(),
    fetchNews(),
    fetchAnnouncements(),
  ]);

  const allItems = [...events.items, ...news.items, ...announcements.items].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  const total = events.total + news.total + announcements.total;
  const totalPages = Math.ceil(total / limit);
  const paginatedItems = allItems.slice(0, limit);

  res.json({
    success: true,
    data: {
      items: paginatedItems,
      pagination: { page, limit, total, pages: Math.max(1, totalPages) },
    },
  });
};

export const getApprovalStats = async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const isGlobalApprover = hasGlobalPermission(user, Permission.APPROVE_CONTENT) || hasGlobalPermission(user, Permission.REJECT_CONTENT);
  const accessibleOrgIds = [...new Set([
    ...getAccessibleOrganizationIdsForAuthenticatedUser(user, Permission.APPROVE_CONTENT),
    ...getAccessibleOrganizationIdsForAuthenticatedUser(user, Permission.REJECT_CONTENT),
  ])];

  const buildCountFilter = (): Record<string, unknown> => {
    if (isGlobalApprover || accessibleOrgIds.length === 0) {return { status: 'pending_approval' };}
    return {
      status: 'pending_approval',
      $or: [
        { ownerType: ContentOwnerType.SYSTEM },
        { ownerType: ContentOwnerType.ORGANIZATION, organizationId: { $in: accessibleOrgIds } },
      ],
    };
  };

  const filter = buildCountFilter();
  const [events, news, announcements] = await Promise.all([
    Event.countDocuments(filter),
    News.countDocuments(filter),
    Announcement.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      pending: events + news + announcements,
      byType: { events, news, announcements },
    },
  });
};

export const getApprovalHistory = async (req: AuthRequest, res: Response) => {
  const { contentType, contentId } = req.params;

  const validTypes = ['news', 'announcement', 'event'];
  if (!validTypes.includes(contentType)) {
    res.status(400).json({ success: false, message: 'Invalid content type' });
    return;
  }

  const actions = await ContentApprovalAction.find({ contentType: contentType as 'news' | 'announcement' | 'event', contentId })
    .populate('actorUserId', 'firstName lastName')
    .sort({ createdAt: -1 })
    .lean();

  const mappedActions = actions.map((a) => ({
    action: a.action,
    actorUserId: a.actorUserId && typeof a.actorUserId === 'object' && 'firstName' in a.actorUserId
      ? (a.actorUserId as unknown as { _id: string; firstName: string; lastName: string })._id.toString()
      : a.actorUserId?.toString() ?? '',
    actorDisplayName: a.actorUserId && typeof a.actorUserId === 'object' && 'firstName' in a.actorUserId
      ? `${(a.actorUserId as unknown as { firstName: string; lastName: string }).firstName} ${(a.actorUserId as unknown as { firstName: string; lastName: string }).lastName}`
      : 'Unknown',
    timestamp: a.createdAt?.toISOString() ?? new Date().toISOString(),
    reason: a.reason,
    comment: a.comment,
    fromStatus: a.fromStatus ?? '',
    toStatus: a.toStatus ?? '',
  }));

  res.json({
    success: true,
    data: { actions: mappedActions },
  });
};
