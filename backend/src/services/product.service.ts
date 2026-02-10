import { query, queryOne, queryCount } from "../config/database";
import { Product, PaginatedResponse } from "../types";

const SELECT_PRODUCT = `
  SELECT p.*, c.name as category_name, s.name as supplier_name
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN suppliers s ON s.id = p.supplier_id
`;

export class ProductService {
  static async getAll(
    page = 1,
    limit = 10,
    search?: string,
    categoryId?: string,
    supplierId?: string,
    lowStock?: boolean,
  ): Promise<PaginatedResponse<Product>> {
    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (search) {
      conditions.push(`(p.name ILIKE $${idx} OR p.sku ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (categoryId) {
      conditions.push(`p.category_id = $${idx}`);
      params.push(categoryId);
      idx++;
    }
    if (supplierId) {
      conditions.push(`p.supplier_id = $${idx}`);
      params.push(supplierId);
      idx++;
    }
    if (lowStock) {
      conditions.push(`p.stock <= p.min_stock`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM products p ${whereClause}`,
      params,
    );
    const total = parseInt(countResult?.count || "0");

    const dataParams = [...params, limit, offset];
    const data = await query<Product>(
      `${SELECT_PRODUCT} ${whereClause} ORDER BY p.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      dataParams,
    );

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getById(id: string): Promise<Product | null> {
    return queryOne<Product>(`${SELECT_PRODUCT} WHERE p.id = $1`, [id]);
  }

  static async create(data: {
    name: string;
    sku: string;
    price: number;
    stock: number;
    min_stock: number;
    category_id: string;
    supplier_id: string;
    image?: string;
    description?: string;
  }): Promise<Product> {
    const result = await queryOne<Product>(
      `INSERT INTO products (name, sku, price, stock, min_stock, category_id, supplier_id, image, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.name,
        data.sku,
        data.price,
        data.stock,
        data.min_stock,
        data.category_id,
        data.supplier_id,
        data.image || null,
        data.description || null,
      ],
    );
    return result!;
  }

  static async update(
    id: string,
    data: Partial<{
      name: string;
      sku: string;
      price: number;
      stock: number;
      min_stock: number;
      category_id: string;
      supplier_id: string;
      image: string;
      description: string;
    }>,
  ): Promise<Product | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const fieldMap: Record<string, any> = data;
    for (const [key, value] of Object.entries(fieldMap)) {
      if (value !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) return this.getById(id);

    values.push(id);
    return queryOne<Product>(
      `UPDATE products SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values,
    );
  }

  static async delete(id: string): Promise<boolean> {
    const count = await queryCount("DELETE FROM products WHERE id = $1", [id]);
    return count > 0;
  }
}
