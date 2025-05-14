import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';
import { Booking, Ticket } from './booking.service';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private apiUrl = `${environment.apiUrl}/bookings`;
  // Default TTL of 5 minutes for ticket data
  private defaultTtl = 300000;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private cacheService: CacheService
  ) {}
  // Get ticket by ID - no separate endpoint needed as this is handled by the booking service
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
          this.toastService.error('Failed to load ticket');
          return this.handleError(error);
        })
      );
  }

  // Helper method to get tickets from a booking object
  getTicketsFromBooking(booking: Booking): Ticket[] {
    return booking.ticket_items || [];
  }

  // Error handling
  private handleError(error: any) {
    console.error('API error:', error);
    return throwError(() => error);
  }
}
