import prisma from '../db/client';
// import { Prisma } from '@prisma/client'; // MongoDB only
import { PaginationParams } from '../types';

export class CommentRepository {
  async create(data: Prisma.CommentCreateInput) {
    return prisma.comment.create({
      data,
      include: {
        user: {
          select: { id: true, username: true, fullName: true, avatar: true },
        },
      },
    });
  }

  async findByCampaign(campaignId: string, pagination: PaginationParams = {}) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { campaignId },
        include: {
          user: {
            select: { id: true, username: true, fullName: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where: { campaignId } }),
    ]);

    return { comments, total, page, limit };
  }

  async delete(id: string, userId: string): Promise<void> {
    const comment = await prisma.comment.findFirst({
      where: { id, userId },
    });

    if (comment) {
      await prisma.comment.delete({ where: { id } });
    }
  }
}
