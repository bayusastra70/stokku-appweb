import { Router } from "express";
import { processImage } from "../controllers/ocr.controller";
import { upload } from "../middleware/upload";

const router = Router();

// Endpoint: POST /api/ocr/scan
router.post("/scan", upload.single("image"), processImage);

export default router;
