// Admin Middleware - Check if user is admin or moderator

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { sendError } from '../utils/response';
import prisma from '../db/client';

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401);
  }

  // Check if user is admin or moderator
  prisma.user
    .findUnique({
      where: { id: req.user.id },
      select: { role: true },
    })
    .then((user) => {
      if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
        return sendError(res, 'Admin access required', 403);
      }

      req.user = { ...req.user, role: user.role } as any;
      next();
    })
    .catch((error) => {
      console.error('[AdminMiddleware] Error checking user role:', error);
      return sendError(res, 'Error checking permissions', 500);
    });
}

export function requireAdminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401);
  }

  prisma.user
    .findUnique({
      where: { id: req.user.id },
      select: { role: true },
    })
    .then((user) => {
      if (!user || user.role !== 'admin') {
        return sendError(res, 'Admin access required', 403);
      }

      req.user = { ...req.user, role: user.role } as any;
      next();
    })
    .catch((error) => {
      console.error('[AdminMiddleware] Error checking user role:', error);
      return sendError(res, 'Error checking permissions', 500);
    });
}

