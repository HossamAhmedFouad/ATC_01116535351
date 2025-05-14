import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';
import { Booking, Ticket } from './booking.service';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  // Get ticket by ID - no separate endpoint needed as this is handled by the booking service
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
