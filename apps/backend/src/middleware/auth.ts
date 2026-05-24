import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { IAuthenticatedUser, IJWTPayload } from '../types';
import logger from '../utils/logger';
import { buildAuthenticatedUser } from '../utils/rbac';

// Extend Express Request type
export interface AuthRequest extends Request<Record<string, string>> {
  user?: IAuthenticatedUser;
}

const getTokenFromRequest = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  const token = req.cookies?.token;
  return typeof token === 'string' ? token : null;
};

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No token provided. Authorization denied.',
      });
      return;
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET is not defined in environment variables');
      res.status(500).json({
        success: false,
        message: 'Server configuration error',
      });
      return;
    }
    
    const decoded = jwt.verify(token, jwtSecret) as IJWTPayload;
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Your account has been deactivated',
      });
      return;
    }

    try {
      req.user = await buildAuthenticatedUser(user);
    } catch {
      res.status(403).json({
        success: false,
        message: 'Your assigned role is no longer valid',
      });
      return;
    }
    
    next();
  } catch (error: any) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token has expired',
      });
      return;
    }
    
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

/**
 * Middleware to optionally verify JWT token and attach user to request if valid
 * Does NOT fail if no token or invalid token
 */
export const optionalAuthenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  
  try {
    const token = getTokenFromRequest(req);
    
    if (token) {
      const jwtSecret = process.env.JWT_SECRET;
      
      if (jwtSecret) {
        try {
          const decoded = jwt.verify(token, jwtSecret) as IJWTPayload;
          const user = await User.findById(decoded.userId);

          if (user?.isActive) {
            try {
              req.user = await buildAuthenticatedUser(user);
            } catch {
              req.user = undefined;
            }
          }
        } catch {
          // Token invalid or expired, proceed as unauthenticated
        }
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
