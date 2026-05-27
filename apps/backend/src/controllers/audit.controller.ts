import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import ActivityLog from '../models/ActivityLog';
import User from '../models/User';
import { sanitizeSearchInput } from '../utils/escapeRegex';
import { parsePagination, buildPaginatedResult } from '../utils/pagination';

export const getAuditLogs = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>, 50, 100);
  const search = (req.query.search as string) || '';
  const action = (req.query.action as string) || '';
  const resource = (req.query.resource as string) || (req.query.resourceType as string) || '';
  const userId = (req.query.userId as string) || '';
  const startDate = (req.query.startDate as string) || '';
  const endDate = (req.query.endDate as string) || '';

  const filter: Record<string, unknown> = {};

  if (search) {
    const safeSearch = sanitizeSearchInput(search) || '';

    const matchingUsers = await User.find({
      $or: [
        { firstName: { $regex: safeSearch, $options: 'i' } },
        { lastName: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
      ],
    })
      .select('_id')
      .lean();

    const matchingUserIds = matchingUsers.map((u) => String(u._id));

    filter.$or = [
      { action: { $regex: safeSearch, $options: 'i' } },
      { resource: { $regex: safeSearch, $options: 'i' } },
      { resourceId: { $regex: safeSearch, $options: 'i' } },
      { ipAddress: { $regex: safeSearch, $options: 'i' } },
      ...(matchingUserIds.length > 0 ? [{ user: { $in: matchingUserIds } }] : []),
    ];
  }

  if (action) {
    filter.action = action;
  }

  if (resource) {
    filter.resource = resource;
  }

  if (userId) {
    filter.user = userId;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      (filter.createdAt as Record<string, unknown>).$gte = new Date(startDate);
    }
    if (endDate) {
      (filter.createdAt as Record<string, unknown>).$lte = new Date(endDate);
    }
  }

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ActivityLog.countDocuments(filter),
  ]);

  const userIds: string[] = logs
    .map((log) => log.user as string)
    .filter((id): id is string => !!id);

  const users = await User.find({ _id: { $in: userIds } })
    .select('firstName lastName email')
    .lean();

  const userMap = new Map(
    users.map((u) => [String(u._id), { firstName: u.firstName, lastName: u.lastName, email: u.email }])
  );

  const logsWithUser = logs.map((log) => {
    const uid = log.user as string;
    return {
      ...log,
      user: uid ? userMap.get(uid) || { firstName: 'Unknown', lastName: 'User', email: '' } : null,
    };
  });

  res.json({
    success: true,
    ...buildPaginatedResult(logsWithUser, total, { page, limit, skip }),
  });
};

export const getAuditLogById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const log = await ActivityLog.findById(req.params.id).lean();

  if (!log) {
    res.status(404).json({ success: false, message: 'Audit log not found' });
    return;
  }

  let userInfo = null;
  if (log.user) {
    const user = await User.findById(log.user).select('firstName lastName email').lean();
    if (user) {
      userInfo = { firstName: user.firstName, lastName: user.lastName, email: user.email };
    }
  }

  res.json({
    success: true,
    data: {
      ...log,
      user: userInfo,
    },
  });
};

export const getAuditSummary = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const startDate = (req.query.startDate as string) || '';
  const endDate = (req.query.endDate as string) || '';

  const filter: Record<string, unknown> = {};

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      (filter.createdAt as Record<string, unknown>).$gte = new Date(startDate);
    }
    if (endDate) {
      (filter.createdAt as Record<string, unknown>).$lte = new Date(endDate);
    }
  }

  const summary = await ActivityLog.aggregate([
    { $match: filter },
    {
      $group: {
        _id: { $ifNull: ['$resource', 'unknown'] },
        totalCount: { $sum: 1 },
        actions: { $push: '$action' },
      },
    },
    {
      $project: {
        _id: 1,
        totalCount: 1,
        uniqueActions: { $setUnion: ['$actions', []] },
      },
    },
    { $sort: { totalCount: -1 } },
  ]);

  res.json({
    success: true,
    data: summary,
  });
};
