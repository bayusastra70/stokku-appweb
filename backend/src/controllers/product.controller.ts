import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";

export class ProductController {
  /** GET /api/products */
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;
      const categoryId = req.query.category_id as string | undefined;
      const supplierId = req.query.supplier_id as string | undefined;
      const lowStock = req.query.low_stock === "true";

      const result = await ProductService.getAll(
        page,
        limit,
        search,
        categoryId,
        supplierId,
        lowStock,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /** GET /api/products/:id */
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getById(req.params.id);
      if (!product) {
        res.status(404).json({ error: "Produk tidak ditemukan." });
        return;
      }
      res.json(product);
    } catch (err) {
      next(err);
    }
  }

  /** POST /api/products */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = { ...req.body };
      const file = (req as any).file;
      if (file) {
        payload.image = `/uploads/${file.filename}`;
      }
      const product = await ProductService.create(payload);
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  }

  /** PUT /api/products/:id */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = { ...req.body };
      const file = (req as any).file;
      if (file) {
        payload.image = `/uploads/${file.filename}`;
      }
      const product = await ProductService.update(req.params.id, payload);
      if (!product) {
        res.status(404).json({ error: "Produk tidak ditemukan." });
        return;
      }
      res.json(product);
    } catch (err) {
      next(err);
    }
  }

  /** DELETE /api/products/:id */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await ProductService.delete(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Produk tidak ditemukan." });
        return;
      }
      res.json({ message: "Produk berhasil dihapus." });
    } catch (err) {
      next(err);
    }
  }
}
