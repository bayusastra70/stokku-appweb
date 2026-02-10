import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { pool, query } from "../config/database";

async function seed() {
  console.log("🌱 Seeding database...");
  try {
    // Hash password for seed users
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Read and execute seed SQL, replacing placeholder hash
    const seedPath = path.join(__dirname, "seed.sql");
    let sql = fs.readFileSync(seedPath, "utf-8");
    sql = sql.replace(/\$2a\$10\$YourHashHere/g, hashedPassword);

    await pool.query(sql);

    // Add some stock logs using existing data
    const users = await query("SELECT id FROM users LIMIT 3");
    const products = await query("SELECT id FROM products LIMIT 5");

    if (users.length > 0 && products.length > 0) {
      const logValues: string[] = [];
      const now = new Date();

      for (let i = 0; i < 10; i++) {
        const user = users[i % users.length];
        const product = products[i % products.length];
        const type = i % 3 === 0 ? "out" : "in";
        const reason = type === "in" ? "purchase" : "sale";
        const qty = Math.floor(Math.random() * 20) + 1;
        const date = new Date(now.getTime() - i * 3600000 * 4); // Every 4 hours back

        logValues.push(
          `('${product.id}', '${user.id}', '${type}', ${qty}, '${reason}', 'Seed data log #${i + 1}', '${date.toISOString()}')`,
        );
      }

      await pool.query(`
        INSERT INTO stock_logs (product_id, user_id, type, quantity, reason, notes, created_at)
        VALUES ${logValues.join(",\n")}
        ON CONFLICT DO NOTHING
      `);
    }

    console.log("✅ Seed completed successfully!");
  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    await pool.end();
  }
}

seed();
