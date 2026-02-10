import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  /** POST /api/auth/login */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json(result);
    } catch (err: any) {
      if (err.message.includes("Email atau password")) {
        res.status(401).json({ error: err.message });
      } else {
        next(err);
      }
    }
  }

  /** GET /api/auth/me */
  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getProfile(req.user!.userId);
      if (!user) {
        res.status(404).json({ error: "User tidak ditemukan." });
        return;
      }
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
}
