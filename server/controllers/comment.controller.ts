import { Response } from 'express';
import { CommentService } from '../services/comment.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendPaginated } from '../utils/response';

export class CommentController {
  private commentService: CommentService;

  constructor() {
    this.commentService = new CommentService();
  }

  createComment = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { campaignId, content } = req.body;
    
    const comment = await this.commentService.createComment(userId, campaignId, content);
    sendSuccess(res, comment, 'Comment added successfully', 201);
  };

  getCampaignComments = async (req: AuthRequest, res: Response) => {
    const { campaignId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await this.commentService.getCampaignComments(
      campaignId,
      { page: Number(page), limit: Number(limit) }
    );

    sendPaginated(res, result.comments, result.page, result.limit, result.total);
  };

  deleteComment = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    
    const result = await this.commentService.deleteComment(id, userId);
    sendSuccess(res, result);
  };
}
