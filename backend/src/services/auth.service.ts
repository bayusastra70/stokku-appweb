import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { query, queryOne } from "../config/database";
import { User, LoginResponse, JwtPayload } from "../types";

export class AuthService {
  /**
   * Login user & return JWT token
   */
  static async login(email: string, password: string): Promise<LoginResponse> {
    const user = await queryOne<User>(
      "SELECT * FROM users WHERE email = $1 AND is_active = true",
      [email],
    );

    if (!user) {
      throw new Error("Email atau password salah.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Email atau password salah.");
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
  }

  /**
   * Get current user profile
   */
  static async getProfile(
    userId: string,
  ): Promise<Omit<User, "password"> | null> {
    const user = await queryOne<User>(
      "SELECT id, name, email, role, avatar, is_active, created_at, updated_at FROM users WHERE id = $1",
      [userId],
    );
    return user;
  }
}
