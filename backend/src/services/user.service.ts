import bcrypt from "bcryptjs";
import { query, queryOne, queryCount } from "../config/database";
import { User, PaginatedResponse } from "../types";

type UserWithoutPassword = Omit<User, "password">;

const SELECT_USER = `SELECT id, name, email, role, avatar, is_active, created_at, updated_at FROM users`;

export class UserService {
  /**
   * Get all users (paginated)
   */
  static async getAll(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResponse<UserWithoutPassword>> {
    const offset = (page - 1) * limit;
    let whereClause = "";
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      whereClause = `WHERE name ILIKE $1 OR email ILIKE $1`;
    }

    const countResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM users ${whereClause}`,
      params,
    );
    const total = parseInt(countResult?.count || "0");

    const dataParams = [...params, limit, offset];
    const data = await query<UserWithoutPassword>(
      `${SELECT_USER} ${whereClause} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      dataParams,
    );

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get user by ID
   */
  static async getById(id: string): Promise<UserWithoutPassword | null> {
    return queryOne<UserWithoutPassword>(`${SELECT_USER} WHERE id = $1`, [id]);
  }

  /**
   * Create new user
   */
  static async create(data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }): Promise<UserWithoutPassword> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const result = await queryOne<UserWithoutPassword>(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, avatar, is_active, created_at, updated_at`,
      [data.name, data.email, hashedPassword, data.role],
    );
    return result!;
  }

  /**
   * Update user
   */
  static async update(
    id: string,
    data: { name?: string; email?: string; role?: string; is_active?: boolean },
  ): Promise<UserWithoutPassword | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(data.name);
    }
    if (data.email !== undefined) {
      fields.push(`email = $${idx++}`);
      values.push(data.email);
    }
    if (data.role !== undefined) {
      fields.push(`role = $${idx++}`);
      values.push(data.role);
    }
    if (data.is_active !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(data.is_active);
    }

    if (fields.length === 0) return this.getById(id);

    values.push(id);
    return queryOne<UserWithoutPassword>(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${idx}
       RETURNING id, name, email, role, avatar, is_active, created_at, updated_at`,
      values,
    );
  }

  /**
   * Toggle user active status
   */
  static async toggleActive(id: string): Promise<UserWithoutPassword | null> {
    return queryOne<UserWithoutPassword>(
      `UPDATE users SET is_active = NOT is_active WHERE id = $1
       RETURNING id, name, email, role, avatar, is_active, created_at, updated_at`,
      [id],
    );
  }

  /**
   * Delete user
   */
  static async delete(id: string): Promise<boolean> {
    const count = await queryCount("DELETE FROM users WHERE id = $1", [id]);
    return count > 0;
  }
}
