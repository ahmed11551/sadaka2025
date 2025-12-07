import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { UnauthorizedError } from '../utils/errors';
import { UserRepository } from '../repositories/user.repository';

const userRepository = new UserRepository();

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).session?.userId;
    
    if (!userId) {
      throw new UnauthorizedError('Please login to continue');
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).session?.userId;
    
    if (userId) {
      const user = await userRepository.findById(userId);
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
