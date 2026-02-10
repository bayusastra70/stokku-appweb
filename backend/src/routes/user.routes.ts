import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { z } from "zod";

const router = Router();

const createUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["admin", "manager", "staff"]),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["admin", "manager", "staff"]).optional(),
  is_active: z.boolean().optional(),
});

// All routes require auth
router.use(authenticate);

router.get("/", UserController.getAll);
router.get("/:id", UserController.getById);
router.post(
  "/",
  authorize("admin"),
  validate(createUserSchema),
  UserController.create,
);
router.put(
  "/:id",
  authorize("admin"),
  validate(updateUserSchema),
  UserController.update,
);
router.patch(
  "/:id/toggle-active",
  authorize("admin"),
  UserController.toggleActive,
);
router.delete("/:id", authorize("admin"), UserController.delete);

export default router;
