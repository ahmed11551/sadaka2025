import { UserRepository } from '../repositories/user.repository';
import { UnauthorizedError } from '../utils/errors';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
    phone?: string;
    country?: string;
    city?: string;
  }) {
    const user = await this.userRepository.create(data);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await this.userRepository.verifyPassword(user, password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const stats = await this.userRepository.getUserStats(userId);
    const { password, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      stats,
    };
  }

  async updateProfile(userId: string, data: {
    fullName?: string;
    phone?: string;
    city?: string;
    avatar?: string;
  }) {
    const user = await this.userRepository.update(userId, data);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const isValid = await this.userRepository.verifyPassword(user, currentPassword);
    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    await this.userRepository.updatePassword(userId, newPassword);
    return { message: 'Password updated successfully' };
  }
}
