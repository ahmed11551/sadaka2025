import type { Express } from "express";
import { createServer, type Server } from "http";
import { Router } from 'express';
import { AuthController } from './controllers/auth.controller';
import { CampaignController } from './controllers/campaign.controller';
import { DonationController } from './controllers/donation.controller';
import { PartnerController } from './controllers/partner.controller';
import { FavoriteController } from './controllers/favorite.controller';
import { CommentController } from './controllers/comment.controller';
import { UploadController, upload } from './controllers/upload.controller';
import { ProxyController } from './controllers/proxy.controller';
import { requireAuth, optionalAuth } from './middleware/auth';
import { validate } from './middleware/validate';
import { asyncHandler } from './middleware/error';
import multer from 'multer';
import {
  registerSchema,
  loginSchema,
  campaignCreateSchema,
  donationCreateSchema,
  partnerCreateSchema,
  commentCreateSchema,
} from './utils/validators';

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const router = Router();

  // Initialize controllers
  const authController = new AuthController();
  const campaignController = new CampaignController();
  const donationController = new DonationController();
  const partnerController = new PartnerController();
  const favoriteController = new FavoriteController();
  const commentController = new CommentController();
  const uploadController = new UploadController();
  const proxyController = new ProxyController();

  // ============= PROXY ROUTES FOR EXTERNAL API (CORS bypass) =============
  // Proxy all requests to external API to avoid CORS issues
  // Must be registered BEFORE other routes to catch /external/* paths
  router.all('/external/:path(*)', asyncHandler(proxyController.proxyRequest));
  router.options('/external/:path(*)', proxyController.handleOptions);

  // ============= AUTH ROUTES =============
  router.post('/auth/register', validate(registerSchema), asyncHandler(authController.register));
  router.post('/auth/login', validate(loginSchema), asyncHandler(authController.login));
  router.post('/auth/logout', asyncHandler(authController.logout));
  router.get('/auth/me', optionalAuth, asyncHandler(authController.getCurrentUser));
  router.get('/auth/profile', requireAuth, asyncHandler(authController.getProfile));
  router.patch('/auth/profile', requireAuth, asyncHandler(authController.updateProfile));
  router.post('/auth/change-password', requireAuth, asyncHandler(authController.changePassword));

  // ============= CAMPAIGN ROUTES =============
  router.get('/campaigns', optionalAuth, asyncHandler(campaignController.getCampaigns));
  router.get('/campaigns/favorites', requireAuth, asyncHandler(campaignController.getUserFavorites));
  router.get('/campaigns/:id', optionalAuth, asyncHandler(campaignController.getCampaign));
  router.get('/campaigns/slug/:slug', optionalAuth, asyncHandler(campaignController.getCampaignBySlug));
  router.post('/campaigns', requireAuth, validate(campaignCreateSchema), asyncHandler(campaignController.createCampaign));
  router.patch('/campaigns/:id', requireAuth, asyncHandler(campaignController.updateCampaign));
  router.delete('/campaigns/:id', requireAuth, asyncHandler(campaignController.deleteCampaign));

  // ============= DONATION ROUTES =============
  router.post('/donations', optionalAuth, validate(donationCreateSchema), asyncHandler(donationController.createDonation));
  router.get('/donations/my', requireAuth, asyncHandler(donationController.getUserDonations));
  router.get('/donations/campaign/:campaignId', optionalAuth, asyncHandler(donationController.getCampaignDonations));
  router.get('/donations/stats', requireAuth, asyncHandler(donationController.getUserStats));

  // ============= PARTNER ROUTES =============
  router.get('/partners', asyncHandler(partnerController.getPartners));
  router.get('/partners/:id', asyncHandler(partnerController.getPartner));
  router.get('/partners/slug/:slug', asyncHandler(partnerController.getPartnerBySlug));
  router.post('/partners', validate(partnerCreateSchema), asyncHandler(partnerController.createPartner));
  router.patch('/partners/:id', asyncHandler(partnerController.updatePartner));
  router.get('/partners/:id/campaigns', asyncHandler(partnerController.getPartnerCampaigns));

  // ============= FAVORITE ROUTES =============
  router.post('/favorites/toggle', requireAuth, asyncHandler(favoriteController.toggleFavorite));
  router.get('/favorites', requireAuth, asyncHandler(favoriteController.getUserFavorites));
  router.get('/favorites/:campaignId', requireAuth, asyncHandler(favoriteController.checkFavorite));

  // ============= COMMENT ROUTES =============
  router.post('/comments', requireAuth, validate(commentCreateSchema), asyncHandler(commentController.createComment));
  router.get('/comments/campaign/:campaignId', optionalAuth, asyncHandler(commentController.getCampaignComments));
  router.delete('/comments/:id', requireAuth, asyncHandler(commentController.deleteComment));

  // ============= UPLOAD ROUTES =============
  router.post('/upload/image', requireAuth, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  }, asyncHandler(uploadController.uploadImage));

  // Mount all routes under /api
  app.use('/api', router);

  return httpServer;
}
