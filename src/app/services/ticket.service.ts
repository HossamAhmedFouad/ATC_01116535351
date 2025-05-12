import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';

export interface Ticket {
  id: number;
  booking_id: number;
  ticket_code: string;
  price: number;
  issued_date: Date;
  status: 'confirmed' | 'cancelled';
}

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private mockTicketsUrl = 'assets/data/tickets.json'; // Path to mock ticket data

  constructor(private http: HttpClient) {}

  // Get tickets for a specific booking
  getTicketsForBooking(bookingId: number): Observable<Ticket[]> {
    return this.http
      .get<Ticket[]>(this.mockTicketsUrl)
      .pipe(
        map((tickets: Ticket[]) =>
          tickets.filter((ticket) => ticket.booking_id === bookingId)
        )
      );
  }
  // Create a ticket (mocked)
  createTicket(bookingId: number, ticketData: Ticket): Observable<Ticket> {
    return of({
      ...ticketData,
      id: Math.floor(Math.random() * 1000), // Mock ticket ID
      booking_id: bookingId,
      status: 'confirmed', // Default status for new tickets
    });
  }
  // Cancel a ticket (mocked)
  cancelTicket(ticketId: number): Observable<any> {
    return of({ success: true }); // Mock success response
  }

  // Update ticket status (mocked)
  updateTicketStatus(
    ticketId: number,
    status: 'confirmed' | 'cancelled'
  ): Observable<any> {
    return of({ success: true, ticketId, status }); // Mock success response
  }
}
