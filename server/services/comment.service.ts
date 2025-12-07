import { CommentRepository } from '../repositories/comment.repository';
import { PaginationParams } from '../types';
// import { Prisma } from '@prisma/client'; // MongoDB only

export class CommentService {
  private commentRepository: CommentRepository;

  constructor() {
    this.commentRepository = new CommentRepository();
  }

  async createComment(userId: string, campaignId: string, content: string) {
    const commentData: Prisma.CommentCreateInput = {
      content,
      user: { connect: { id: userId } },
      campaign: { connect: { id: campaignId } },
    };

    return this.commentRepository.create(commentData);
  }

  async getCampaignComments(campaignId: string, pagination: PaginationParams = {}) {
    return this.commentRepository.findByCampaign(campaignId, pagination);
  }

  async deleteComment(commentId: string, userId: string) {
    await this.commentRepository.delete(commentId, userId);
    return { message: 'Comment deleted successfully' };
  }
}
