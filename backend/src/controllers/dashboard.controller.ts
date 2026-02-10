import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/dashboard.service";

export class DashboardController {
  /** GET /api/dashboard/stats */
  static async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardService.getStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }

  /** GET /api/dashboard/chart */
  static async getChart(_req: Request, res: Response, next: NextFunction) {
    try {
      const chart = await DashboardService.getChartData();
      res.json(chart);
    } catch (err) {
      next(err);
    }
  }

  /** GET /api/dashboard/low-stock */
  static async getLowStock(_req: Request, res: Response, next: NextFunction) {
    try {
      const products = await DashboardService.getLowStockProducts();
      res.json(products);
    } catch (err) {
      next(err);
    }
  }

  /** GET /api/dashboard/activity */
  static async getActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activity = await DashboardService.getRecentActivity(limit);
      res.json(activity);
    } catch (err) {
      next(err);
    }
  }
}
