import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import productRoutes from "./product.routes";
import categoryRoutes from "./category.routes";
import supplierRoutes from "./supplier.routes";
import stockRoutes from "./stock.routes";
import dashboardRoutes from "./dashboard.routes";
import ocrRoutes from "./ocr.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/stock", stockRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/ocr", ocrRoutes);

export default router;
