import { Router } from "express";
import {
  AssetsController,
  upload,
  handleMulterError,
} from "../controllers/assets.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
const assetsController = new AssetsController();

// File upload route - Protected, requires authentication
router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  assetsController.uploadFile
);

// Delete file route - Protected, requires admin role
router.delete(
  "/:bucket",
  authenticate,
  authorize(["ADMIN"]),
  assetsController.deleteFile
);

// Add multer error handling middleware
router.use(handleMulterError);

export default router;
