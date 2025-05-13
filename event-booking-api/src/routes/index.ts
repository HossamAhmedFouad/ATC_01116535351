import { Router } from "express";
import userRoutes from "./user.routes";

const router = Router();

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Mount user routes
router.use("/users", userRoutes);

// Add more routes here as the application grows
// For example: router.use('/events', eventRoutes);

export default router;
