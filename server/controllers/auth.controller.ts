import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response) => {
    const user = await this.authService.register(req.body);
    
    (req as any).session.userId = user.id;
    
    sendSuccess(res, user, 'Registration successful', 201);
  };

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await this.authService.login(email, password);
    
    (req as any).session.userId = user.id;
    
    sendSuccess(res, user, 'Login successful');
  };

  logout = async (req: Request, res: Response) => {
    (req as any).session.destroy();
    sendSuccess(res, null, 'Logged out successfully');
  };

  getProfile = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const profile = await this.authService.getProfile(userId);
    sendSuccess(res, profile);
  };

  updateProfile = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const user = await this.authService.updateProfile(userId, req.body);
    sendSuccess(res, user, 'Profile updated successfully');
  };

  changePassword = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;
    const result = await this.authService.changePassword(userId, currentPassword, newPassword);
    sendSuccess(res, result);
  };

  getCurrentUser = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendSuccess(res, null);
    }
    
    const { password, ...user } = req.user;
    sendSuccess(res, user);
  };
}
