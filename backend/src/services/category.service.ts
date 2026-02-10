import { query, queryOne, queryCount } from "../config/database";
import { Category, PaginatedResponse } from "../types";

export class CategoryService {
  static async getAll(
    page = 1,
    limit = 20,
    search?: string,
  ): Promise<PaginatedResponse<Category & { product_count: number }>> {
    const offset = (page - 1) * limit;
    let whereClause = "";
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      whereClause = `WHERE c.name ILIKE $1`;
    }

    const countResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM categories c ${whereClause}`,
      params,
    );
    const total = parseInt(countResult?.count || "0");

    const dataParams = [...params, limit, offset];
    const data = await query<Category & { product_count: number }>(
      `SELECT c.*, COALESCE(COUNT(p.id), 0)::int as product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       ${whereClause}
       GROUP BY c.id
       ORDER BY c.name ASC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      dataParams,
    );

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Get all categories (no pagination, for dropdowns) */
  static async getAllSimple(): Promise<Category[]> {
    return query<Category>("SELECT * FROM categories ORDER BY name ASC");
  }

  static async getById(id: string): Promise<Category | null> {
    return queryOne<Category>("SELECT * FROM categories WHERE id = $1", [id]);
  }

  static async create(data: {
    name: string;
    description?: string;
  }): Promise<Category> {
    const result = await queryOne<Category>(
      `INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *`,
      [data.name, data.description || null],
    );
    return result!;
  }

  static async update(
    id: string,
    data: { name?: string; description?: string },
  ): Promise<Category | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(data.description);
    }

    if (fields.length === 0) return this.getById(id);

    values.push(id);
    return queryOne<Category>(
      `UPDATE categories SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values,
    );
  }

  static async delete(id: string): Promise<boolean> {
    const count = await queryCount("DELETE FROM categories WHERE id = $1", [
      id,
    ]);
    return count > 0;
  }
}
