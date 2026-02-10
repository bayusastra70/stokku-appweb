import { pool } from "../config/database";

async function reset() {
  console.log("⚠️  Resetting database...");
  try {
    await pool.query(`
      DROP TABLE IF EXISTS stock_logs CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS suppliers CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
    `);
    console.log(
      "✅ All tables dropped. Run 'npm run db:migrate' and 'npm run db:seed' to recreate.",
    );
  } catch (err) {
    console.error("❌ Reset failed:", err);
  } finally {
    await pool.end();
  }
}

reset();
