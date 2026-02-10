import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { z } from "zod";

const router = Router();

const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter"),
  description: z.string().optional(),
});

router.use(authenticate);

router.get("/", CategoryController.getAll);
router.get("/:id", CategoryController.getById);
router.post(
  "/",
  authorize("admin", "manager"),
  validate(categorySchema),
  CategoryController.create,
);
router.put(
  "/:id",
  authorize("admin", "manager"),
  validate(categorySchema.partial()),
  CategoryController.update,
);
router.delete("/:id", authorize("admin"), CategoryController.delete);

export default router;
