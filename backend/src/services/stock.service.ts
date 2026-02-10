import { query, queryOne, queryCount } from "../config/database";
import { StockLog, PaginatedResponse } from "../types";

const SELECT_LOG = `
  SELECT sl.*, p.name as product_name, u.name as user_name
  FROM stock_logs sl
  LEFT JOIN products p ON p.id = sl.product_id
  LEFT JOIN users u ON u.id = sl.user_id
`;

export class StockService {
  /**
   * Record stock in/out + update product stock
   */
  static async recordStock(data: {
    product_id: string;
    user_id: string;
    type: "in" | "out";
    quantity: number;
    reason: string;
    notes?: string;
  }): Promise<StockLog> {
    // Validate product exists
    const product = await queryOne<{ id: string; stock: number; name: string }>(
      "SELECT id, stock, name FROM products WHERE id = $1",
      [data.product_id],
    );

    if (!product) {
      throw new Error("Produk tidak ditemukan.");
    }

    // Check sufficient stock for outgoing
    if (data.type === "out" && product.stock < data.quantity) {
      throw new Error(
        `Stok tidak cukup. Stok tersedia: ${product.stock} unit.`,
      );
    }

    // Update product stock
    const stockChange = data.type === "in" ? data.quantity : -data.quantity;
    await queryOne("UPDATE products SET stock = stock + $1 WHERE id = $2", [
      stockChange,
      data.product_id,
    ]);

    // Create stock log
    const log = await queryOne<StockLog>(
      `INSERT INTO stock_logs (product_id, user_id, type, quantity, reason, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        data.product_id,
        data.user_id,
        data.type,
        data.quantity,
        data.reason,
        data.notes || null,
      ],
    );

    return log!;
  }

  /**
   * Get stock logs (paginated, with filters)
   */
  static async getLogs(
    page = 1,
    limit = 20,
    type?: "in" | "out",
    productId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<PaginatedResponse<StockLog>> {
    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (type) {
      conditions.push(`sl.type = $${idx}`);
      params.push(type);
      idx++;
    }
    if (productId) {
      conditions.push(`sl.product_id = $${idx}`);
      params.push(productId);
      idx++;
    }
    if (startDate) {
      conditions.push(`sl.created_at >= $${idx}`);
      params.push(startDate);
      idx++;
    }
    if (endDate) {
      conditions.push(`sl.created_at <= $${idx}`);
      params.push(endDate);
      idx++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM stock_logs sl ${whereClause}`,
      params,
    );
    const total = parseInt(countResult?.count || "0");

    const dataParams = [...params, limit, offset];
    const data = await query<StockLog>(
      `${SELECT_LOG} ${whereClause} ORDER BY sl.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      dataParams,
    );

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
