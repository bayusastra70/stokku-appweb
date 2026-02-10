import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/category.service";

export class CategoryController {
  /** GET /api/categories */
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      // If ?simple=true, return flat list (for dropdowns)
      if (req.query.simple === "true") {
        const data = await CategoryService.getAllSimple();
        res.json(data);
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;
      const result = await CategoryService.getAll(page, limit, search);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /** GET /api/categories/:id */
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const cat = await CategoryService.getById(req.params.id);
      if (!cat) {
        res.status(404).json({ error: "Kategori tidak ditemukan." });
        return;
      }
      res.json(cat);
    } catch (err) {
      next(err);
    }
  }

  /** POST /api/categories */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const cat = await CategoryService.create(req.body);
      res.status(201).json(cat);
    } catch (err) {
      next(err);
    }
  }

  /** PUT /api/categories/:id */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const cat = await CategoryService.update(req.params.id, req.body);
      if (!cat) {
        res.status(404).json({ error: "Kategori tidak ditemukan." });
        return;
      }
      res.json(cat);
    } catch (err) {
      next(err);
    }
  }

  /** DELETE /api/categories/:id */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await CategoryService.delete(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Kategori tidak ditemukan." });
        return;
      }
      res.json({ message: "Kategori berhasil dihapus." });
    } catch (err) {
      next(err);
    }
  }
}
