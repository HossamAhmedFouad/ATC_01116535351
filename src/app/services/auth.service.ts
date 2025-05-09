import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { delay, tap, map, catchError } from 'rxjs/operators';

export interface BookedEvent {
  id: number;
  title: string;
  date: Date;
  location: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  ticketType: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  attendees: number;
  organizer: string;
  progress: number;
  tags: string[];
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  location?: string;
  phone?: string;
  bio?: string;
  bookedEvents?: BookedEvent[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private eventsUrl = 'assets/data/events.json'; // Path to your JSON file
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check for stored user data on service initialization
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  signIn(email: string, password: string): Observable<AuthResponse> {
    // For development, simulate API call
    return this.loadEventsFromJson().pipe(
      map(events => ({
        user: {
          id: 1,
          name: 'Test User',
          username: 'testuser',
          email: email,
          location: 'San Francisco, CA',
          bookedEvents: events
        },
        token: 'mock-jwt-token'
      })),
      delay(1000), // Simulate network delay
      tap(response => this.handleAuthResponse(response))
    );
  }

  signUp(userData: {
    name: string;
    username: string;
    email: string;
    password: string;
    location: string;
  }): Observable<AuthResponse> {
    // For development, simulate API call
    return this.loadEventsFromJson().pipe(
      map(events => ({
        user: {
          id: 1,
          ...userData,
          bookedEvents: events
        },
        token: 'mock-jwt-token'
      })),
      delay(1000), // Simulate network delay
      tap(response => this.handleAuthResponse(response))
    );
  }

  signInWithGoogle(): Observable<AuthResponse> {
    // For development, simulate API call
    return this.loadEventsFromJson().pipe(
      map(events => ({
        user: {
          id: 1,
          name: 'Google User',
          username: 'googleuser',
          email: 'google@example.com',
          location: 'San Francisco, CA',
          bookedEvents: events
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

  private loadEventsFromJson(): Observable<BookedEvent[]> {
    return this.http.get<{ events: any[] }>(this.eventsUrl).pipe(
      map(data => data.events.map(event => ({
        id: event.id,
        title: event.title,
        date: new Date(event.date), // Convert string date to Date object
        location: event.location,
        status: 'completed' as 'upcoming' | 'completed' | 'cancelled', // Default status
        ticketType: 'Standard', // Default ticket type
        price: event.price,
        category: event.category,
        description: event.description,
        imageUrl: event.imageUrl,
        attendees: 0, // Default attendees
        organizer: event.organizer || 'Unknown Organizer', // Use organizer from JSON or default
        progress: 100, // Default progress
        tags: event.tags || [], // Use tags from JSON or empty array
      }))),
      catchError(error => {
        console.error('Error loading events from JSON:', error);
        return of([]); // Return empty array on error
      })
    );
  }
} 