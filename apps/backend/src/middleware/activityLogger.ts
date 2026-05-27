import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import ActivityLog from '../models/ActivityLog';
import logger from '../utils/logger';

const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'refreshToken',
  'accessToken',
  'qrToken',
  'currentPassword',
  'newPassword',
  'authorization',
  'studentNumber',
];

function sanitizeDeep(obj: unknown, depth = 0): unknown {
  if (depth > 10) {return '[MAX_DEPTH]';}
  if (typeof obj !== 'object' || obj === null) {return obj;}

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeDeep(item, depth + 1));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.some(f => key.toLowerCase().includes(f.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = sanitizeDeep(value, depth + 1);
    }
  }
  return sanitized;
}

/**
 * Middleware to log admin activities
 */
export const logActivity = (action: string, resource: string) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const originalSend = res.send;

      res.send = function (data: any): Response {
        if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
          const resourceId = req.params.id || req.body?.id || undefined;

          ActivityLog.create({
            user: req.user.userId,
            action,
            resource,
            resourceId,
            details: {
              method: req.method,
              path: req.path,
              body: sanitizeDeep(req.body),
              query: req.query,
            },
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.get('user-agent'),
          }).catch((error) => {
            logger.error('Failed to log activity:', error);
          });
        }

        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Activity logging middleware error:', error);
      next();
    }
  };
};
