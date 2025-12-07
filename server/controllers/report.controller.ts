// Report Controller - Handle report generation and export

import { Response } from 'express';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../middleware/error';
import { ReportService } from '../services/report.service';

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  /**
   * GET /api/reports/donations/export?format=csv&from=&to=
   * Export donations report
   */
  exportDonationsReport = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { format = 'csv', from, to, userId, campaignId, partnerId, type, category } = req.query;

    const filters = {
      ...(userId && { userId: userId as string }),
      ...(campaignId && { campaignId: campaignId as string }),
      ...(partnerId && { partnerId: partnerId as string }),
      ...(type && { type: type as string }),
      ...(category && { category: category as string }),
      ...(from && { fromDate: new Date(from as string) }),
      ...(to && { toDate: new Date(to as string) }),
    };

    if (format === 'csv') {
      const csv = await this.reportService.generateCSVReport(filters);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="donations-${Date.now()}.csv"`);
      res.send('\ufeff' + csv); // BOM for Excel UTF-8 support
      return;
    }

    sendError(res, 'Unsupported format. Use: csv', 400);
  });

  /**
   * GET /api/reports/stats
   * Get summary statistics
   */
  getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { from, to, userId, campaignId, partnerId, type, category } = req.query;

    const filters = {
      ...(userId && { userId: userId as string }),
      ...(campaignId && { campaignId: campaignId as string }),
      ...(partnerId && { partnerId: partnerId as string }),
      ...(type && { type: type as string }),
      ...(category && { category: category as string }),
      ...(from && { fromDate: new Date(from as string) }),
      ...(to && { toDate: new Date(to as string) }),
    };

    const stats = await this.reportService.getSummaryStats(filters);
    sendSuccess(res, stats);
  });
}

