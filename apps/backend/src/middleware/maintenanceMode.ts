import { Request, Response, NextFunction } from 'express';
import SystemConfig from '../models/SystemConfig';

export const maintenanceMode = async (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/admin') || req.path === '/health') {
    return next();
  }

  try {
    const config = await SystemConfig.findOne({ group: 'maintenance' })
      .select('value')
      .lean();
    if (config?.value && (config.value as Record<string, unknown>).enabled === true) {
      const message = (config.value as Record<string, unknown>).message as string || 'Under maintenance';
      return res.status(503).json({
        success: false,
        message,
        maintenance: true,
      });
    }
  } catch {
    // Fail open — if DB is unreachable, do not block traffic
  }

  next();
};
