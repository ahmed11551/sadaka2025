import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

const EXTERNAL_API_BASE_URL = 'https://bot.e-replika.ru/api';
const EXTERNAL_API_TOKEN = 'test_token_123';

// Insan API configuration
const INSAN_API_BASE_URL = 'https://fondinsan.ru/api/v1';
const INSAN_ACCESS_TOKEN = process.env.INSAN_ACCESS_TOKEN || '0xRs6obpvPOx4lkGLYxepBOcMju';

export class ProxyController {
  /**
   * Proxy requests to external API to avoid CORS issues
   */
  proxyRequest = async (req: Request, res: Response) => {
    try {
      // Extract path from request
      // req.params.path contains the wildcard match from router.all('/:path(*)')
      let path = '';
      if (req.params && typeof req.params === 'object' && 'path' in req.params) {
        path = req.params['path'] || '';
      } else if (req.path) {
        // Fallback: use req.path directly (remove /api prefix if present)
        path = req.path.replace(/^\/api\/?/, '') || '';
      }
      
      // Remove leading slash if present
      if (path.startsWith('/')) {
        path = path.slice(1);
      }
      
      // Check if this is an Insan API request
      const isInsanApi = path.startsWith('insan/');
      if (isInsanApi) {
        // Remove 'insan/' prefix
        path = path.replace(/^insan\//, '');
      }
      
      const method = req.method;
      const queryString = req.url.includes('?') ? req.url.split('?')[1] : '';
      
      let url: string;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (isInsanApi) {
        // Proxy to Insan API
        const insanPath = path || '';
        const insanQuery = queryString 
          ? `${queryString}&access-token=${INSAN_ACCESS_TOKEN}`
          : `access-token=${INSAN_ACCESS_TOKEN}`;
        url = `${INSAN_API_BASE_URL}/${insanPath}?${insanQuery}`;
        console.log(`[proxy] ${method} ${req.path} -> ${url} (Insan API)`);
      } else {
        // Proxy to bot.e-replika.ru API
        // Remove /v1 from path if already present (to avoid double v1)
        let cleanPath = path;
        if (cleanPath.startsWith('v1/')) {
          cleanPath = cleanPath.replace(/^v1\//, '');
        }
        // Add /v1 prefix to all API paths
        const apiPath = cleanPath ? `v1/${cleanPath}` : 'v1';
        url = `${EXTERNAL_API_BASE_URL}/${apiPath}${queryString ? `?${queryString}` : ''}`;
        headers['Authorization'] = `Bearer ${EXTERNAL_API_TOKEN}`;
        console.log(`[proxy] ${method} ${req.path} -> ${url}`);
      }
      
      console.log(`[proxy] extracted path:`, path);

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

