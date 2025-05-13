import { Router } from "express";
import userRoutes from "./user.routes";
import eventRoutes from "./event.routes";
import bookingRoutes from "./booking.routes";

const router = Router();

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Mount routes
router.use("/users", userRoutes);
router.use("/events", eventRoutes);
router.use("/bookings", bookingRoutes);

export default router;
