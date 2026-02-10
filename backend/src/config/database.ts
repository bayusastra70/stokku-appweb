import { Pool } from "pg";
import { env } from "./env";

export const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
});

// Test connection
pool.on("connect", () => {
  console.log("📦 Connected to PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL error:", err.message);
});

// Helper: run a query
export async function query<T = any>(
  text: string,
  params?: any[],
): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

// Helper: run a query and return first row
export async function queryOne<T = any>(
  text: string,
  params?: any[],
): Promise<T | null> {
  const result = await pool.query(text, params);
  return (result.rows[0] as T) || null;
}

// Helper: run a query and return row count
export async function queryCount(
  text: string,
  params?: any[],
): Promise<number> {
  const result = await pool.query(text, params);
  return result.rowCount || 0;
}
