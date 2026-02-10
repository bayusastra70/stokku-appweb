import { query, queryOne } from "../config/database";
import { DashboardStats, ChartData } from "../types";

export class DashboardService {
  /**
   * Get dashboard summary stats
   */
  static async getStats(): Promise<DashboardStats> {
    const result = await queryOne<{
      total_products: string;
      total_stock: string;
      low_stock_count: string;
      total_suppliers: string;
      total_stock_value: string;
    }>(`
      SELECT
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COALESCE(SUM(stock), 0) FROM products) as total_stock,
        (SELECT COUNT(*) FROM products WHERE stock <= min_stock) as low_stock_count,
        (SELECT COUNT(*) FROM suppliers) as total_suppliers,
        (SELECT COALESCE(SUM(stock * price), 0) FROM products) as total_stock_value
    `);

    return {
      totalProducts: parseInt(result?.total_products || "0"),
      totalStock: parseInt(result?.total_stock || "0"),
      lowStockCount: parseInt(result?.low_stock_count || "0"),
      totalSuppliers: parseInt(result?.total_suppliers || "0"),
      totalStockValue: parseFloat(result?.total_stock_value || "0"),
    };
  }

  /**
   * Get stock movement chart data (last 7 days)
   */
  static async getChartData(): Promise<ChartData> {
    const labels: string[] = [];
    const stockIn: number[] = [];
    const stockOut: number[] = [];
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      const dayEnd = new Date(dayStart.getTime() + 86400000);

      labels.push(dayNames[date.getDay()]);

      const inResult = await queryOne<{ total: string }>(
        `SELECT COALESCE(SUM(quantity), 0) as total FROM stock_logs WHERE type = 'in' AND created_at >= $1 AND created_at < $2`,
        [dayStart.toISOString(), dayEnd.toISOString()],
      );
      stockIn.push(parseInt(inResult?.total || "0"));

      const outResult = await queryOne<{ total: string }>(
        `SELECT COALESCE(SUM(quantity), 0) as total FROM stock_logs WHERE type = 'out' AND created_at >= $1 AND created_at < $2`,
        [dayStart.toISOString(), dayEnd.toISOString()],
      );
      stockOut.push(parseInt(outResult?.total || "0"));
    }

    return { labels, stockIn, stockOut };
  }

  /**
   * Get low stock products
   */
  static async getLowStockProducts() {
    return query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.stock <= p.min_stock
       ORDER BY p.stock ASC
       LIMIT 10`,
    );
  }

  /**
   * Get recent stock activity
   */
  static async getRecentActivity(limit = 10) {
    return query(
      `SELECT sl.*, p.name as product_name, u.name as user_name
       FROM stock_logs sl
       LEFT JOIN products p ON p.id = sl.product_id
       LEFT JOIN users u ON u.id = sl.user_id
       ORDER BY sl.created_at DESC
       LIMIT $1`,
      [limit],
    );
  }
}
