import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { z } from "zod";
import { upload } from "../middleware/upload";

const router = Router();

const createProductSchema = z.object({
  name: z.string().min(2, "Nama produk minimal 2 karakter"),
  sku: z.string().min(1, "SKU wajib diisi"),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
  stock: z.coerce.number().int().min(0, "Stok tidak boleh negatif"),
  min_stock: z.coerce.number().int().min(0, "Stok minimum tidak boleh negatif"),
  category_id: z.string().uuid("ID kategori tidak valid"),
  supplier_id: z.string().uuid("ID supplier tidak valid"),
  description: z.string().optional(),
});

const updateProductSchema = createProductSchema.partial();

router.use(authenticate);

router.get("/", ProductController.getAll);
router.get("/:id", ProductController.getById);
router.post(
  "/",
  authorize("admin", "manager"),
  upload.single("image"),
  validate(createProductSchema),
  ProductController.create,
);
router.put(
  "/:id",
  authorize("admin", "manager"),
  upload.single("image"),
  validate(updateProductSchema),
  ProductController.update,
);
router.delete("/:id", authorize("admin"), ProductController.delete);

export default router;
