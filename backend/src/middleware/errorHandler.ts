import { Request, Response, NextFunction } from "express";

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error("❌ Error:", err.message);

  if (err.message.includes("duplicate key")) {
    res.status(409).json({ error: "Data sudah ada (duplikasi)." });
    return;
  }

  if (err.message.includes("violates foreign key")) {
    res.status(400).json({ error: "Referensi data tidak valid." });
    return;
  }

  if (err.message.includes("violates check constraint")) {
    res
      .status(400)
      .json({ error: "Data tidak memenuhi batasan yang ditentukan." });
    return;
  }

  res.status(500).json({
    error: "Terjadi kesalahan internal server.",
    ...(process.env.NODE_ENV === "development" && { detail: err.message }),
  });
}
