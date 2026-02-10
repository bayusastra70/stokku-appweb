import { Router } from "express";
import { SupplierController } from "../controllers/supplier.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { z } from "zod";

const router = Router();

const supplierSchema = z.object({
  name: z.string().min(2, "Nama supplier minimal 2 karakter"),
  phone: z.string().min(5, "No. telepon minimal 5 karakter"),
  email: z
    .string()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal("")),
  address: z.string().optional(),
});

router.use(authenticate);

router.get("/", SupplierController.getAll);
router.get("/:id", SupplierController.getById);
router.post(
  "/",
  authorize("admin", "manager"),
  validate(supplierSchema),
  SupplierController.create,
);
router.put(
  "/:id",
  authorize("admin", "manager"),
  validate(supplierSchema.partial()),
  SupplierController.update,
);
router.delete("/:id", authorize("admin"), SupplierController.delete);

export default router;
