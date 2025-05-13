import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { TicketService, Ticket } from './ticket.service';

export interface Booking {
  id: number;
  user_id: number;
  event_id: number;
  booking_time: Date | string;
  updated_at: Date;
  tickets: number;
  total_price: number;
  status: 'booked' | 'cancelled' | 'completed';
  ticketList?: Ticket[]; // To store the tickets related to this booking
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private mockDataUrl = 'assets/data/bookings.json'; // Path to the mock JSON file

  constructor(private http: HttpClient, private ticketService: TicketService) {}
  // Get bookings only if a user is logged in
  getUserBookings(id: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.mockDataUrl).pipe(
      map((bookings) => bookings.filter((booking) => booking.user_id === id)),
      map((bookings) =>
        bookings.map((booking) => ({
          ...booking,
          bookingDate: new Date(booking.booking_time), // Convert string to Date if needed
        }))
      ),
      switchMap((bookings) => {
        if (bookings.length === 0) {
          return of([]);
        }
        // Create an array of observables for fetching tickets for each booking
        const bookingWithTicketsObservables = bookings.map((booking) =>
          this.ticketService.getTicketsForBooking(booking.id).pipe(
            map((tickets) => ({
              ...booking,
              ticketList: tickets,
            }))
          )
        );
        // Combine all the observables into one that emits when all are complete
        return forkJoin(bookingWithTicketsObservables);
      })
    );
  }
  // Book an event (mocked)
  bookEvent(
    eventId: number,
    ticketCount: number = 1,
    price: number = 100
  ): Observable<Booking> {
    const mockBooking = {
      id: Math.floor(Math.random() * 1000), // Mock ID
      user_id: 1, // Mock user ID (replace with actual logic if needed)
      event_id: eventId,
      booking_time: new Date(),
      updated_at: new Date(),
      tickets: ticketCount, // Number of tickets
      total_price: price * ticketCount, // Calculate total price
      status: 'booked' as const,
      ticketList: [],
    };

    return of(mockBooking).pipe(
      switchMap((booking) => {
        // Create tickets for the booking
        const ticketCreationObservables = [];
        for (let i = 0; i < ticketCount; i++) {
          // Generate a random ticket code
          const ticketCode = `TKT-${Math.random()
            .toString(36)
            .substring(2, 11)
            .toUpperCase()}`;

          // Create a ticket
          const ticketData = {
            id: 0, // Will be set by the service
            booking_id: booking.id,
            ticket_code: ticketCode,
            price: price,
            issued_date: new Date(),
            status: 'confirmed' as const,
          };

          ticketCreationObservables.push(
            this.ticketService.createTicket(booking.id, ticketData)
          );
        }

        // Combine ticket creation observables
        return forkJoin(ticketCreationObservables).pipe(
          map((tickets) => {
            return {
              ...booking,
              ticketList: tickets,
            };
          })
        );
      })
    );
  }
  // Cancel a booking (mocked)
  cancelBooking(bookingId: number): Observable<any> {
    // First get tickets for this booking
    return this.ticketService.getTicketsForBooking(bookingId).pipe(
      switchMap((tickets) => {
        // Create an array of observables to update all ticket statuses
        const updateTicketStatusObservables = tickets.map((ticket) =>
          this.ticketService.updateTicketStatus(ticket.id, 'cancelled')
        );

        // If there are tickets to update, update them first
        if (updateTicketStatusObservables.length > 0) {
          return forkJoin(updateTicketStatusObservables).pipe(
            // After updating all tickets, return success
            map(() => ({
              success: true,
              message: 'Booking and tickets cancelled',
            }))
          );
        } else {
          // If no tickets, just return success
          return of({
            success: true,
            message: 'Booking cancelled, no tickets found',
          });
        }
      })
    );
  }
  // Admin: Get all bookings (mocked)
  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.mockDataUrl).pipe(
      switchMap((bookings) => {
        if (bookings.length === 0) {
          return of([]);
        }

        // Create an array of observables for fetching tickets for each booking
        const bookingWithTicketsObservables = bookings.map((booking) =>
          this.ticketService.getTicketsForBooking(booking.id).pipe(
            map((tickets) => ({
              ...booking,
              ticketList: tickets,
            }))
          )
        );

        // Combine all the observables into one that emits when all are complete
        return forkJoin(bookingWithTicketsObservables);
      })
    );
  }
}
