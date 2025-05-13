import { Router } from "express";
import { EventController } from "../controllers/event.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
const eventController = new EventController();

// Public routes
router.get("/", authenticate, eventController.getAllEvents);
router.get("/search", authenticate, eventController.searchEvents);
router.get("/:id", authenticate, eventController.getEventById);

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

export default router;
