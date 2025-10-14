import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { createError } from './errorHandler';

export interface AuthRequest extends Request {
  authUser?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Access token required', 401);
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;
    
    console.log('Auth middleware: Verifying token:', token.substring(0, 20) + '...');
    console.log('Auth middleware: JWT secret exists:', !!secret);
    
    if (!secret) {
      throw createError('JWT secret not configured', 500);
    }

    const decoded = jwt.verify(token, secret) as any;
    console.log('Auth middleware: Token decoded successfully:', { userId: decoded.userId, email: decoded.email });
    
    // Verify user still exists in database
    let client;
    try {
      client = await pool.connect();
    } catch (dbError) {
      // Database not available - create demo user for demo tokens
      if (decoded.userId === 'demo-user-id') {
        req.authUser = {
          id: 'demo-user-id',
          email: 'demo@example.com',
          role: 'intern'
        };
        next();
        return;
      } else {
        throw createError('Database not available', 503);
      }
    }

    try {
      const result = await client.query(
        'SELECT id, email, role FROM users WHERE id = $1',
        [decoded.userId]
      );
      
      if (result.rows.length === 0) {
        throw createError('User not found', 401);
      }
      
      req.authUser = result.rows[0];
      next();
    } finally {
      client.release();
    }
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      next(createError('Invalid token', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(createError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      next(createError('Authentication required', 401));
      return;
    }
    
    if (!roles.includes(req.authUser.role)) {
      next(createError('Insufficient permissions', 403));
      return;
    }
    
    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      next();
      return;
    }

    const decoded = jwt.verify(token, secret) as any;
    
    // Verify user still exists in database
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, email, role FROM users WHERE id = $1',
        [decoded.userId]
      );
      
      if (result.rows.length > 0) {
        req.authUser = result.rows[0];
      }
    } finally {
      client.release();
    }
    
    next();
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    next();
  }
};
