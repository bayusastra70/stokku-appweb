import { Request, Response, NextFunction } from "express";
import { SupplierService } from "../services/supplier.service";

export class SupplierController {
  /** GET /api/suppliers */
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.query.simple === "true") {
        const data = await SupplierService.getAllSimple();
        res.json(data);
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;
      const result = await SupplierService.getAll(page, limit, search);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /** GET /api/suppliers/:id */
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const sup = await SupplierService.getById(req.params.id);
      if (!sup) {
        res.status(404).json({ error: "Supplier tidak ditemukan." });
        return;
      }
      res.json(sup);
    } catch (err) {
      next(err);
    }
  }

  /** POST /api/suppliers */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const sup = await SupplierService.create(req.body);
      res.status(201).json(sup);
    } catch (err) {
      next(err);
    }
  }

  /** PUT /api/suppliers/:id */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const sup = await SupplierService.update(req.params.id, req.body);
      if (!sup) {
        res.status(404).json({ error: "Supplier tidak ditemukan." });
        return;
      }
      res.json(sup);
    } catch (err) {
      next(err);
    }
  }

  /** DELETE /api/suppliers/:id */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await SupplierService.delete(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Supplier tidak ditemukan." });
        return;
      }
      res.json({ message: "Supplier berhasil dihapus." });
    } catch (err) {
      next(err);
    }
  }
}
