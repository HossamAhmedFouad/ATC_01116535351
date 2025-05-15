import { Router } from "express";
import { EventController } from "../controllers/event.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
const eventController = new EventController();

// Public routes
router.get("/", eventController.getAllEvents);
router.get("/search", eventController.searchEvents);

// Admin only routes - Must come before dynamic routes
router.get(
  "/admin",
  authenticate,
  authorize(["ADMIN"]),
  eventController.getAdminEvents
);
router.get(
  "/export",
  authenticate,
  authorize(["ADMIN"]),
  eventController.exportEvents
);
router.post(
  "/",
  authenticate,
  authorize(["ADMIN"]),
  eventController.createEvent
);

// Bulk operations (admin only) - Must come before dynamic routes
router.patch(
  "/bulk-update",
  authenticate,
  authorize(["ADMIN"]),
  eventController.bulkUpdateEvents
);
router.post(
  "/bulk-delete",
  authenticate,
  authorize(["ADMIN"]),
  eventController.bulkDeleteEvents
);

// Dynamic parameter routes - keep at the end to avoid conflicts
router.get("/:id", eventController.getEventById);
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
