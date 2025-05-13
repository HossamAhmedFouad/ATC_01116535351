import { Request, Response, NextFunction } from "express";
import {
  BookingService,
  CreateBookingInput,
} from "../services/booking.service";
import { AppError } from "../middleware/error";

export class BookingController {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
  }

  /**
   * Create a new booking
   */
  createBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.userId) {
        throw new AppError("Authentication required", 401);
      }

      const bookingData: CreateBookingInput = {
        ...req.body,
        user_id: req.user.userId,
      };

      // Validate required fields
      if (!bookingData.event_id || !bookingData.tickets_count) {
        throw new AppError("Event ID and ticket count are required", 400);
      }

      const result = await this.bookingService.createBooking(bookingData);

      res.status(201).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all bookings for the current user
   */
  getUserBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.userId) {
        throw new AppError("Authentication required", 401);
      }

      const bookings = await this.bookingService.getUserBookings(
        req.user.userId
      );

      res.status(200).json({
        status: "success",
        results: bookings.length,
        data: { bookings },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get booking by ID
   */
  getBookingById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.userId) {
        throw new AppError("Authentication required", 401);
      }

      const { id } = req.params;
      const booking = await this.bookingService.getBookingById(id);

      // Check if booking belongs to the user or user is admin
      if (
        booking.user_id.toString() !== req.user.userId &&
        req.user.role !== "ADMIN"
      ) {
        throw new AppError("Unauthorized", 403);
      }

      res.status(200).json({
        status: "success",
        data: { booking },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cancel a booking
   */
  cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.userId) {
        throw new AppError("Authentication required", 401);
      }

      const { id } = req.params;
      const booking = await this.bookingService.cancelBooking(
        id,
        req.user.userId
      );

      res.status(200).json({
        status: "success",
        data: { booking },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get ticket by ID
   */
  getTicketById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.userId) {
        throw new AppError("Authentication required", 401);
      }

      const { id } = req.params;
      const ticket = await this.bookingService.getTicketById(id);

      // Check if ticket's booking belongs to the user or user is admin
      if (
        ticket.bookings.user_id.toString() !== req.user.userId &&
        req.user.role !== "ADMIN"
      ) {
        throw new AppError("Unauthorized", 403);
      }

      res.status(200).json({
        status: "success",
        data: { ticket },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all bookings (admin only)
   */
  getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // This should only be accessible by admins, check is done in middleware
      const bookings = await this.bookingService.getAllBookings();

      res.status(200).json({
        status: "success",
        results: bookings.length,
        data: { bookings },
      });
    } catch (error) {
      next(error);
    }
  };
}
