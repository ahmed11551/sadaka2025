import type { Express } from "express";
import { createServer, type Server } from "http";
import { Router } from 'express';
import { ProxyController } from './controllers/proxy.controller';
import { asyncHandler } from './middleware/error';

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const router = Router();

  // Initialize proxy controller
  const proxyController = new ProxyController();

  // ============= PROXY ALL REQUESTS TO EXTERNAL API =============
  // All requests are proxied to bot.e-replika.ru/api/v1 with test_token_123
  // No local authentication needed - all auth handled by external API
  router.all('/:path(*)', asyncHandler(proxyController.proxyRequest));
  router.options('/:path(*)', proxyController.handleOptions);

  // Mount all routes under /api
  app.use('/api', router);

  return httpServer;
}
