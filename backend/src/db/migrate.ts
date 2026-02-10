import fs from "fs";
import path from "path";
import { pool } from "../config/database";

async function migrate() {
  console.log("🚀 Running database migration...");
  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf-8");
    await pool.query(sql);
    console.log("✅ Migration completed successfully!");
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await pool.end();
  }
}

migrate();
