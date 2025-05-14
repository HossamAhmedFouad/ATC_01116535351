import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';

export interface Ticket {
  id: string;
  booking_id: string;
  ticket_code: string;
  price: number;
  issued_date: Date;
  status: string;
}

export interface Booking {
  id: string;
  user_id: string;
  event_id: string;
  booking_time: Date;
  updated_at: Date;
  tickets_count: number;
  total_price: number;
  status: string;
  ticket_items?: Ticket[];
  events?: any; // Event details when included
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  // Get bookings for the current logged in user
  getUserBookings(): Observable<Booking[]> {
    return this.http
      .get<{ status: string; results: number; data: { bookings: any[] } }>(
        `${this.apiUrl}/my-bookings`
      )
      .pipe(
        map((response) => {
          return response.data.bookings.map((booking) => ({
            ...booking,
            booking_time: new Date(booking.booking_time),
            updated_at: new Date(booking.updated_at),
          }));
        }),
        catchError((error) => {
          this.toastService.error('Failed to load your bookings');
          return this.handleError(error);
        })
      );
  }

  // Get a single booking by ID
  getBooking(id: string): Observable<Booking> {
    return this.http
      .get<{ status: string; data: { booking: any } }>(`${this.apiUrl}/${id}`)
      .pipe(
        map((response) => ({
          ...response.data.booking,
          booking_time: new Date(response.data.booking.booking_time),
          updated_at: new Date(response.data.booking.updated_at),
        })),
        catchError((error) => {
          this.toastService.error(`Failed to load booking details`);
          return this.handleError(error);
        })
      );
  }

  // Book an event
  bookEvent(
    eventId: string,
    ticketsCount: number,
    totalPrice: number
  ): Observable<Booking> {
    const bookingData = {
      event_id: eventId,
      tickets_count: ticketsCount,
      total_price: totalPrice,
    };

    return this.http
      .post<{ status: string; data: any }>(`${this.apiUrl}`, bookingData)
      .pipe(
        map((response) => ({
          ...response.data.booking,
          booking_time: new Date(response.data.booking.booking_time),
          updated_at: new Date(response.data.booking.updated_at),
          ticket_items: response.data.tickets,
        })),
        catchError((error) => {
          this.toastService.error('Failed to book event');
          return this.handleError(error);
        })
      );
  }

  // Cancel a booking
  cancelBooking(bookingId: string): Observable<Booking> {
    return this.http
      .patch<{ status: string; data: { booking: any } }>(
        `${this.apiUrl}/${bookingId}/cancel`,
        {}
      )
      .pipe(
        map((response) => ({
          ...response.data.booking,
          booking_time: new Date(response.data.booking.booking_time),
          updated_at: new Date(response.data.booking.updated_at),
        })),
        catchError((error) => {
          this.toastService.error('Failed to cancel booking');
          return this.handleError(error);
        })
      );
  }

  // Get ticket by ID
  getTicket(ticketId: string): Observable<Ticket> {
    return this.http
      .get<{ status: string; data: { ticket: any } }>(
        `${this.apiUrl}/tickets/${ticketId}`
      )
      .pipe(
        map((response) => ({
          ...response.data.ticket,
          issued_date: new Date(response.data.ticket.issued_date),
        })),
        catchError((error) => {
          this.toastService.error('Failed to load ticket details');
          return this.handleError(error);
        })
      );
  }

  // Admin: Get all bookings
  getAllBookings(): Observable<Booking[]> {
    return this.http
      .get<{ status: string; results: number; data: { bookings: any[] } }>(
        `${this.apiUrl}`
      )
      .pipe(
        map((response) => {
          return response.data.bookings.map((booking) => ({
            ...booking,
            booking_time: new Date(booking.booking_time),
            updated_at: new Date(booking.updated_at),
          }));
        }),
        catchError((error) => {
          this.toastService.error('Failed to load all bookings');
          return this.handleError(error);
        })
      );
  }

  // Error handling
  private handleError(error: any) {
    console.error('API error:', error);
    return throwError(() => error);
  }
}
