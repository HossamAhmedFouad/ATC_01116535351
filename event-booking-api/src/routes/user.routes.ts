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
router.patch("/profile", authenticate, userController.updateProfile);
router.post("/change-password", authenticate, userController.changePassword);

// Admin only routes
router.get("/", authenticate, authorize(["ADMIN"]), userController.getAllUsers);

export default router;
