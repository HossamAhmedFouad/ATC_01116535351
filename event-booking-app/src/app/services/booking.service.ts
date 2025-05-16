import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';
import { ToastService } from './toast.service';
import { CacheService } from './cache.service';

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
  // Default TTL of 5 minutes for booking data
  private defaultTtl = 300000;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private cacheService: CacheService
  ) {}
  // Get bookings for the current logged in user
  getUserBookings(): Observable<Booking[]> {
    const cacheKey = 'user_bookings';

    // Check if we have cached data
    const cachedData = this.cacheService.get<Booking[]>(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

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
        tap((bookings) => {
          // Cache the result
          this.cacheService.set(cacheKey, bookings, this.defaultTtl);
        }),
        catchError((error) => {
          this.toastService.error('Failed to load your bookings');
          return this.handleError(error);
        })
      );
  }
  // Get a single booking by ID
  getBooking(id: string): Observable<Booking> {
    const cacheKey = `booking_${id}`;

    // Check if we have cached data
    const cachedData = this.cacheService.get<Booking>(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    return this.http
      .get<{ status: string; data: { booking: any } }>(`${this.apiUrl}/${id}`)
      .pipe(
        map((response) => ({
          ...response.data.booking,
          booking_time: new Date(response.data.booking.booking_time),
          updated_at: new Date(response.data.booking.updated_at),
        })),
        tap((booking) => {
          // Cache the result
          this.cacheService.set(cacheKey, booking, this.defaultTtl);
        }),
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
        tap((booking) => {
          // Invalidate user bookings cache when a new booking is created
          this.cacheService.remove('user_bookings');
          // Cache the new booking
          this.cacheService.set(
            `booking_${booking.id}`,
            booking,
            this.defaultTtl
          );
        }),
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
        tap((booking) => {
          // Invalidate user bookings cache
          this.cacheService.remove('user_bookings');
          // Update the specific booking cache
          this.cacheService.set(
            `booking_${bookingId}`,
            booking,
            this.defaultTtl
          );
        }),
        catchError((error) => {
          this.toastService.error('Failed to cancel booking');
          return this.handleError(error);
        })
      );
  }
  // Get ticket by ID
  getTicket(ticketId: string): Observable<Ticket> {
    const cacheKey = `ticket_${ticketId}`;

    // Check if we have cached data
    const cachedData = this.cacheService.get<Ticket>(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    return this.http
      .get<{ status: string; data: { ticket: any } }>(
        `${this.apiUrl}/tickets/${ticketId}`
      )
      .pipe(
        map((response) => ({
          ...response.data.ticket,
          issued_date: new Date(response.data.ticket.issued_date),
        })),
        tap((ticket) => {
          // Cache the result
          this.cacheService.set(cacheKey, ticket, this.defaultTtl);
        }),
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
  // Clear specific cache entry
  clearCache(key: string): void {
    this.cacheService.remove(key);
  }

  // Clear all booking-related cache
  clearAllCache(): void {
    this.cacheService.remove('user_bookings');
    // Clear any booking details cache by pattern
    this.cacheService.clearWithPrefix('booking_');
  }

  // Error handling
  private handleError(error: any) {
    console.error('API error:', error);
    return throwError(() => error);
  }
}
