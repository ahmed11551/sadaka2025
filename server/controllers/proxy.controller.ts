import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

const EXTERNAL_API_BASE_URL = process.env.API_BASE_URL || 'https://bot.e-replika.ru/api/v1';
const EXTERNAL_API_TOKEN = process.env.API_TOKEN || 'test_token_123';

export class ProxyController {
  /**
   * Proxy requests to external API to avoid CORS issues
   */
  proxyRequest = async (req: Request, res: Response) => {
    try {
      // Extract path after /external/
      // req.params.path contains the wildcard match from router.all('/external/:path(*)')
      let path = '';
      if (req.params && typeof req.params === 'object' && 'path' in req.params) {
        path = req.params['path'] || '';
      } else if (req.path) {
        // Fallback: extract from req.path
        path = req.path.replace('/external/', '') || '';
      }
      
      // Remove leading slash if present
      if (path.startsWith('/')) {
        path = path.slice(1);
      }
      
      const method = req.method;
      const queryString = req.url.includes('?') ? req.url.split('?')[1] : '';
      const url = `${EXTERNAL_API_BASE_URL}/${path}${queryString ? `?${queryString}` : ''}`;

      console.log(`[proxy] ${method} ${req.path} -> ${url}`);
      console.log(`[proxy] req.params:`, req.params);
      console.log(`[proxy] extracted path:`, path);

      // Prepare headers
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${EXTERNAL_API_TOKEN}`,
        'Content-Type': 'application/json',
      };

      // Copy relevant headers from request
      if (req.headers['content-type']) {
        headers['Content-Type'] = req.headers['content-type'] as string;
      }

      // Prepare request options
      const options: RequestInit = {
        method,
        headers,
      };

      // Add body for non-GET requests
      if (method !== 'GET' && method !== 'HEAD' && req.body) {
        if (req.headers['content-type']?.includes('application/json')) {
          options.body = JSON.stringify(req.body);
        } else {
          options.body = req.body;
        }
      }

      // Make request to external API
      const response = await fetch(url, options);

      // Get response body
      const contentType = response.headers.get('content-type') || '';
      let body: any;

      if (contentType.includes('application/json')) {
        body = await response.json();
      } else {
        body = await response.text();
      }

      // Forward status code and headers
      res.status(response.status);

      // Copy CORS headers if present
      const corsHeaders = [
        'access-control-allow-origin',
        'access-control-allow-methods',
        'access-control-allow-headers',
        'access-control-allow-credentials',
      ];

      corsHeaders.forEach(header => {
        const value = response.headers.get(header);
        if (value) {
          res.setHeader(header, value);
        }
      });

      // Set CORS headers for our domain
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'true');

      return res.json(body);
      } catch (error: any) {
      return sendError(res, error.message || 'Proxy request failed', 500);
    }
  };

  /**
   * Handle OPTIONS requests for CORS preflight
   */
  handleOptions = (req: Request, res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.sendStatus(204);
  };
}

