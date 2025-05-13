import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { delay, tap, map, catchError } from 'rxjs/operators';
import { Booking, BookingService } from './booking.service';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  role?: string;
  profilePicUrl?: string;
  bookedEvents?: Booking[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private eventsUrl = 'assets/data/events.json'; // Path to your JSON file
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private bookingService: BookingService
  ) {
    // Check for stored user data on service initialization
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  signIn(email: string, password: string): Observable<AuthResponse> {
    // For development, simulate API call
    return this.bookingService.getUserBookings(1).pipe(
      map(bookings => ({
        user: {
          id: 1,
          username: 'testuser',
          email: email,
          location: 'San Francisco, CA',
          bookedEvents: bookings
        },
        token: 'mock-jwt-token'
      })),
      delay(1000), // Simulate network delay
      tap(response => this.handleAuthResponse(response))
    );
  }

  signUp(userData: {
    username: string;
    email: string;
    password: string;
    location: string;
  }): Observable<AuthResponse> {
    // For development, simulate API call
    return this.bookingService.getUserBookings(1).pipe(
      map(bookings => ({
        user: {
          id: 1,
          ...userData,
          bookedEvents: bookings
        },
        token: 'mock-jwt-token'
      })),
      delay(1000), // Simulate network delay
      tap(response => this.handleAuthResponse(response))
    );
  }

  signInWithGoogle(): Observable<AuthResponse> {
    // Fetch the user's bookings from BookingService
    return this.bookingService.getUserBookings(1).pipe(
      map(bookings => ({
        user: {
          id: 1, // Mock user ID (replace with real data later)
          username: 'googleuser',
          email: 'google@example.com',
          location: 'San Francisco, CA',
          bookedEvents: bookings // Use actual bookings
        },
        token: 'mock-jwt-token'
      })),
      delay(1000), // Simulate network delay
      tap(response => this.handleAuthResponse(response))
    );
  }

  signOut(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/signin']);
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem('currentUser', JSON.stringify(response.user));
    localStorage.setItem('token', response.token);
    this.currentUserSubject.next(response.user);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
} 