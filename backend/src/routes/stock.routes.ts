import { Router } from "express";
import { StockController } from "../controllers/stock.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { z } from "zod";

const router = Router();

const recordStockSchema = z.object({
  product_id: z.string().uuid("ID produk tidak valid"),
  type: z.enum(["in", "out"], { message: "Tipe harus 'in' atau 'out'" }),
  quantity: z.number().int().min(1, "Jumlah minimal 1"),
  reason: z.enum(["purchase", "sale", "damaged", "return", "adjustment"]),
  notes: z.string().optional(),
});

router.use(authenticate);

router.post("/", validate(recordStockSchema), StockController.recordStock);
router.get("/logs", StockController.getLogs);

export default router;
