import prisma from "../prisma/client";
import { AppError } from "../middleware/error";
import { bookings } from "../generated/prisma";

export interface CreateBookingInput {
  user_id: string;
  event_id: string;
  tickets_count: number;
  total_price: number;
}

export interface CreateTicketInput {
  booking_id: string;
  price: number;
  ticket_code?: string;
  status?: string;
}

export class BookingService {
  /**
   * Create a new booking
   * @param bookingData Booking data
   * @returns The created booking with tickets
   */
  async createBooking(bookingData: CreateBookingInput) {
    // Check if event exists and has available tickets
    const event = await prisma.events.findUnique({
      where: { id: bookingData.event_id },
    });

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    // Check if there are enough tickets available
    if (
      event.available_tickets === null ||
      event.available_tickets < bookingData.tickets_count
    ) {
      throw new AppError("Not enough tickets available", 400);
    }

    // Start a transaction to ensure data consistency
    return await prisma.$transaction(async (tx) => {
      // Create the booking
      const booking = await tx.bookings.create({
        data: {
          user_id: bookingData.user_id,
          event_id: bookingData.event_id,
          tickets_count: bookingData.tickets_count,
          total_price: bookingData.total_price,
          status: "CONFIRMED",
        },
      }); // Create individual tickets for the booking
      const ticketPromises = [];
      const price = event.price
        ? Number(event.price) / Number(bookingData.tickets_count)
        : 0;

      for (let i = 0; i < bookingData.tickets_count; i++) {
        const ticketCode = `TKT-${Math.random()
          .toString(36)
          .substring(2, 11)
          .toUpperCase()}`;
        ticketPromises.push(
          tx.tickets.create({
            data: {
              booking_id: booking.id,
              ticket_code: ticketCode,
              price: Math.round(price),
              status: "CONFIRMED",
              issued_date: new Date(),
            },
          })
        );
      }

      const tickets = await Promise.all(ticketPromises); // Update available tickets count for the event
      await tx.events.update({
        where: { id: event.id },
        data: {
          available_tickets:
            (event.available_tickets ?? 0) - bookingData.tickets_count,
        },
      });

      return { booking, tickets };
    });
  }
  /**
   * Get all bookings for a user
   * @param userId User ID
   * @returns List of bookings with event details
   */
  async getUserBookings(userId: string) {
    return await prisma.bookings.findMany({
      where: { user_id: userId },
      include: {
        events: true,
        ticket_items: true,
      },
    });
  }

  /**
   * Get booking by ID
   * @param bookingId Booking ID
   * @returns Booking details with event and tickets
   */
  async getBookingById(bookingId: string) {
    const booking = await prisma.bookings.findUnique({
      where: { id: bookingId },
      include: {
        events: true,
        ticket_items: true,
      },
    });

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    return booking;
  }

  /**
   * Cancel a booking
   * @param bookingId Booking ID
   * @param userId User ID (for authorization)
   * @returns Updated booking
   */
  async cancelBooking(bookingId: string, userId: string) {
    // Check if booking exists and belongs to the user
    const booking = await prisma.bookings.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    if (booking.user_id !== userId) {
      throw new AppError("Unauthorized", 403);
    }

    // Update booking status and ticket status in a transaction
    return await prisma.$transaction(async (tx) => {
      // Update the booking status
      const updatedBooking = await tx.bookings.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
        include: { ticket_items: true },
      });

      // Update all tickets status to CANCELLED
      await tx.tickets.updateMany({
        where: { booking_id: bookingId },
        data: { status: "CANCELLED" },
      });

      // Return available tickets to the event
      if (updatedBooking.tickets_count) {
        await tx.events.update({
          where: { id: booking.event_id },
          data: {
            available_tickets: {
              increment: updatedBooking.tickets_count,
            },
          },
        });
      }

      return updatedBooking;
    });
  }

  /**
   * Get ticket by ID
   * @param ticketId Ticket ID
   * @returns Ticket details with booking and event
   */
  async getTicketById(ticketId: string) {
    const ticket = await prisma.tickets.findUnique({
      where: { id: ticketId },
      include: {
        bookings: {
          include: {
            events: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new AppError("Ticket not found", 404);
    }

    return ticket;
  }

  /**
   * Get all bookings (admin only)
   * @returns List of all bookings with related data
   */
  async getAllBookings() {
    return await prisma.bookings.findMany({
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            phone: true,
          },
        },
        events: true,
        ticket_items: true,
      },
    });
  }
}
