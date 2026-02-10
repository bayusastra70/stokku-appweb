import { query, queryOne, queryCount } from "../config/database";
import { Supplier, PaginatedResponse } from "../types";

export class SupplierService {
  static async getAll(
    page = 1,
    limit = 20,
    search?: string,
  ): Promise<PaginatedResponse<Supplier & { product_count: number }>> {
    const offset = (page - 1) * limit;
    let whereClause = "";
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      whereClause = `WHERE s.name ILIKE $1 OR s.email ILIKE $1 OR s.phone ILIKE $1`;
    }

    const countResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM suppliers s ${whereClause}`,
      params,
    );
    const total = parseInt(countResult?.count || "0");

    const dataParams = [...params, limit, offset];
    const data = await query<Supplier & { product_count: number }>(
      `SELECT s.*, COALESCE(COUNT(p.id), 0)::int as product_count
       FROM suppliers s
       LEFT JOIN products p ON p.supplier_id = s.id
       ${whereClause}
       GROUP BY s.id
       ORDER BY s.name ASC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      dataParams,
    );

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Get all suppliers (no pagination, for dropdowns) */
  static async getAllSimple(): Promise<Supplier[]> {
    return query<Supplier>("SELECT * FROM suppliers ORDER BY name ASC");
  }

  static async getById(id: string): Promise<Supplier | null> {
    return queryOne<Supplier>("SELECT * FROM suppliers WHERE id = $1", [id]);
  }

  static async create(data: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  }): Promise<Supplier> {
    const result = await queryOne<Supplier>(
      `INSERT INTO suppliers (name, phone, email, address) VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.name, data.phone, data.email || null, data.address || null],
    );
    return result!;
  }

  static async update(
    id: string,
    data: { name?: string; phone?: string; email?: string; address?: string },
  ): Promise<Supplier | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(data.name);
    }
    if (data.phone !== undefined) {
      fields.push(`phone = $${idx++}`);
      values.push(data.phone);
    }
    if (data.email !== undefined) {
      fields.push(`email = $${idx++}`);
      values.push(data.email);
    }
    if (data.address !== undefined) {
      fields.push(`address = $${idx++}`);
      values.push(data.address);
    }

    if (fields.length === 0) return this.getById(id);

    values.push(id);
    return queryOne<Supplier>(
      `UPDATE suppliers SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values,
    );
  }

  static async delete(id: string): Promise<boolean> {
    const count = await queryCount("DELETE FROM suppliers WHERE id = $1", [id]);
    return count > 0;
  }
}
