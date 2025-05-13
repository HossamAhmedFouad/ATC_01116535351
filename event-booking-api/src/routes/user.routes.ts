import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
const userController = new UserController();

// Public routes
router.post("/register", userController.register);
router.post("/login", userController.login);

// Protected routes
router.get("/profile", authenticate, userController.getProfile);

// Admin only routes - example
router.get("/admin", authenticate, authorize(["ADMIN"]), (req, res) => {
  res.status(200).json({ message: "Admin access granted" });
});

export default router;
