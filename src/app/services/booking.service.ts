import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface Booking {
  id: number;
  user_id: number;
  event_id: number;
  booking_time: Date | string;
  updated_at: Date;
  tickets: number;
  total_price: number;
  status: 'booked' | 'cancelled' | 'completed';
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private mockDataUrl = 'assets/data/bookings.json'; // Path to the mock JSON file

  constructor(
    private http: HttpClient,
  ) {}

  // Get bookings only if a user is logged in
  getUserBookings(id: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.mockDataUrl).pipe(
      map(bookings => bookings.filter(booking => booking.user_id === id)),
      map(bookings => bookings.map(booking => ({
        ...booking,
        bookingDate: new Date(booking.booking_time) // Convert string to Date if needed
      })))
    );
  }

  // Book an event (mocked)
  bookEvent(eventId: number): Observable<Booking> {
    return of({
      id: Math.floor(Math.random() * 1000), // Mock ID
      user_id: 1, // Mock user ID (replace with actual logic if needed)
      event_id: eventId,
      booking_time: new Date(),
      updated_at: new Date(),
      tickets: 1, // Mock tickets
      total_price: 100, // Mock total price
      status: 'booked'
    });
  }

  // Cancel a booking (mocked)
  cancelBooking(bookingId: number): Observable<any> {
    return of({ success: true }); // Mock success response
  }

  // Admin: Get all bookings (mocked)
  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.mockDataUrl);
  }
}
