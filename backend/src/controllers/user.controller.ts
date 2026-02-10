import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";

export class UserController {
  /** GET /api/users */
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;
      const result = await UserService.getAll(page, limit, search);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /** GET /api/users/:id */
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getById(req.params.id);
      if (!user) {
        res.status(404).json({ error: "User tidak ditemukan." });
        return;
      }
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  /** POST /api/users */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.create(req.body);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }

  /** PUT /api/users/:id */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.update(req.params.id, req.body);
      if (!user) {
        res.status(404).json({ error: "User tidak ditemukan." });
        return;
      }
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  /** PATCH /api/users/:id/toggle-active */
  static async toggleActive(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.toggleActive(req.params.id);
      if (!user) {
        res.status(404).json({ error: "User tidak ditemukan." });
        return;
      }
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  /** DELETE /api/users/:id */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await UserService.delete(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "User tidak ditemukan." });
        return;
      }
      res.json({ message: "User berhasil dihapus." });
    } catch (err) {
      next(err);
    }
  }
}
