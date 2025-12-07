import prisma from '../db/client';
import { User, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ConflictError, NotFoundError } from '../utils/errors';

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  async create(data: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
    phone?: string;
    country?: string;
    city?: string;
  }): Promise<User> {
    const existingEmail = await this.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictError('Email already registered');
    }

    const existingUsername = await this.findByUsername(data.username);
    if (existingUsername) {
      throw new ConflictError('Username already taken');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async update(id: string, data: Partial<Omit<User, 'id' | 'password'>>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async updatePassword(id: string, newPassword: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async getUserStats(userId: string) {
    const [donations, campaigns, favorites] = await Promise.all([
      prisma.donation.count({
        where: { userId, paymentStatus: 'completed' },
      }),
      prisma.campaign.count({
        where: { authorId: userId },
      }),
      prisma.favorite.count({
        where: { userId },
      }),
    ]);

    const totalDonated = await prisma.donation.aggregate({
      where: { userId, paymentStatus: 'completed' },
      _sum: { amount: true },
    });

    return {
      totalDonations: donations,
      totalCampaigns: campaigns,
      totalFavorites: favorites,
      totalDonated: totalDonated._sum.amount || 0,
    };
  }
}
