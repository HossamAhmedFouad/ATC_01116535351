import { Router } from "express";
import { EventController } from "../controllers/event.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
const eventController = new EventController();

// Public routes
router.get("/", eventController.getAllEvents);
router.get("/search", eventController.searchEvents);
router.get("/:id", eventController.getEventById);

// Admin only routes
router.post(
  "/",
  authenticate,
  authorize(["ADMIN"]),
  eventController.createEvent
);
router.patch(
  "/:id",
  authenticate,
  authorize(["ADMIN"]),
  eventController.updateEvent
);
router.delete(
  "/:id",
  authenticate,
  authorize(["ADMIN"]),
  eventController.deleteEvent
);
// Cancel event route (admin only)
router.patch(
  "/:id/cancel",
  authenticate,
  authorize(["ADMIN"]),
  eventController.cancelEvent
);

export default router;
