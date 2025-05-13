import { Router } from "express";
import { BookingController } from "../controllers/booking.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
const bookingController = new BookingController();

// Protected routes (all require authentication)
router.use(authenticate);

// User booking routes
router.post("/", bookingController.createBooking);
router.get("/my-bookings", bookingController.getUserBookings);
router.get("/:id", bookingController.getBookingById);
router.patch("/:id/cancel", bookingController.cancelBooking);

// Ticket routes
router.get("/tickets/:id", bookingController.getTicketById);

// Admin only routes
router.get("/", authorize(["ADMIN"]), bookingController.getAllBookings);

export default router;
