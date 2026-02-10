import express from "express";
import cors from "cors";
import path from "path";
import { env } from "./config/env";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// ==========================================
// Middleware
// ==========================================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:4173",
    ],
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ==========================================
// Health Check
// ==========================================
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    name: "Stokku API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// API Routes
// ==========================================
app.use("/api", routes);

// ==========================================
// 404 Handler
// ==========================================
app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan." });
});

// ==========================================
// Error Handler
// ==========================================
app.use(errorHandler);

// ==========================================
// Start Server
// ==========================================
app.listen(env.PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║         🚀 STOKKU API SERVER            ║
  ╠══════════════════════════════════════════╣
  ║  Status  : Running                      ║
  ║  Port    : ${String(env.PORT).padEnd(29)}║
  ║  Mode    : ${env.NODE_ENV.padEnd(29)}║
  ║  URL     : http://localhost:${String(env.PORT).padEnd(14)}║
  ╚══════════════════════════════════════════╝
  `);
});

export default app;
