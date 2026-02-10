import { Request, Response, NextFunction } from "express";
import { StockService } from "../services/stock.service";

export class StockController {
  /** POST /api/stock */
  static async recordStock(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await StockService.recordStock({
        ...req.body,
        user_id: req.user!.userId,
      });
      res.status(201).json(log);
    } catch (err: any) {
      if (
        err.message.includes("Stok tidak cukup") ||
        err.message.includes("tidak ditemukan")
      ) {
        res.status(400).json({ error: err.message });
      } else {
        next(err);
      }
    }
  }

  /** GET /api/stock/logs */
  static async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const type = req.query.type as "in" | "out" | undefined;
      const productId = req.query.product_id as string | undefined;
      const startDate = req.query.start_date as string | undefined;
      const endDate = req.query.end_date as string | undefined;

      const result = await StockService.getLogs(
        page,
        limit,
        type,
        productId,
        startDate,
        endDate,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
