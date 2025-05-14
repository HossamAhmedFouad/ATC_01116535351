import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { delay, tap, map, catchError } from 'rxjs/operators';
import { Booking, BookingService } from './booking.service';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  role?: string;
  profile_url?: string;
  bookedEvents?: Booking[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;
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
    return this.http
      .post<{ status: string; data: AuthResponse }>(
        `${this.apiUrl}/users/login`,
        { email, password }
      )
      .pipe(
        map((response) => response.data),
        tap((response) => this.handleAuthResponse(response)),
        catchError((error) => {
          console.error('Login error:', error);
          return throwError(
            () => new Error(error.error?.message || 'Login failed')
          );
        })
      );
  }
  signUp(userData: {
    username: string;
    email: string;
    password: string;
    location: string;
  }): Observable<AuthResponse> {
    return this.http
      .post<{ status: string; data: AuthResponse }>(
        `${this.apiUrl}/users/register`,
        userData
      )
      .pipe(
        map((response) => response.data),
        tap((response) => this.handleAuthResponse(response)),
        catchError((error) => {
          console.error('Registration error:', error);
          return throwError(
            () => new Error(error.error?.message || 'Registration failed')
          );
        })
      );
  }
  signInWithGoogle(): Observable<AuthResponse> {
    // TODO: Replace with actual Google OAuth implementation once backend endpoint is ready
    // For now, keeping the mock implementation
    console.warn(
      'Google authentication not yet implemented on the backend API'
    );

    // Simulate successful Google authentication for development
    return this.http
      .get<{ status: string; data: AuthResponse }>(
        `${this.apiUrl}/users/google-auth`
      )
      .pipe(
        catchError((error) => {
          // Fallback to mock implementation
          return of({
            status: 'success',
            data: {
              user: {
                id: '1', // Updated to string to match User interface
                username: 'googleuser',
                email: 'google@example.com',
                location: 'San Francisco, CA',
              },
              token: 'mock-jwt-token',
            },
          });
        }),
        map((response) => response.data),
        tap((response) => this.handleAuthResponse(response))
      );
  }
  signOut(): void {
    try {
      // Clear stored authentication data
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');

      // Reset the user subject
      this.currentUserSubject.next(null);

      // Navigate to sign-in page
      this.router.navigate(['/auth/signin']);
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  }
  private handleAuthResponse(response: AuthResponse): void {
    // Store user data and token in localStorage
    if (response && response.user && response.token) {
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
      this.currentUserSubject.next(response.user);
    } else {
      console.error('Invalid authentication response', response);
    }
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserProfile(): Observable<User> {
    return this.http
      .get<{ status: string; data: { user: User } }>(
        `${this.apiUrl}/users/profile`
      )
      .pipe(
        map((response) => response.data.user),
        tap((user) => {
          // Update stored user with fresh data
          const currentUser = this.currentUserSubject.value;
          if (currentUser) {
            const updatedUser = { ...currentUser, ...user };
            this.currentUserSubject.next(updatedUser);
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          }
        }),
        catchError((error) => {
          console.error('Failed to get user profile:', error);
          return throwError(
            () =>
              new Error(error.error?.message || 'Failed to get user profile')
          );
        })
      );
  }

  updateUserProfile(userData: Partial<User>): Observable<User> {
    return this.http
      .patch<{ status: string; data: { user: User } }>(
        `${this.apiUrl}/users/profile`,
        userData
      )
      .pipe(
        map((response) => response.data.user),
        tap((updatedUser) => {
          // Update stored user with fresh data
          const currentUser = this.currentUserSubject.value;
          if (currentUser) {
            const mergedUser = { ...currentUser, ...updatedUser };
            this.currentUserSubject.next(mergedUser);
            localStorage.setItem('currentUser', JSON.stringify(mergedUser));
          }
        }),
        catchError((error) => {
          console.error('Failed to update user profile:', error);
          return throwError(
            () =>
              new Error(error.error?.message || 'Failed to update user profile')
          );
        })
      );
  }

  /**
   * Check if the current authentication token is still valid
   * If it's expired, try to refresh the session
   */
  checkAuthStatus(): Observable<boolean> {
    const token = localStorage.getItem('token');

    if (!token) {
      return of(false);
    }

    // Verify token by making a request to the profile endpoint
    return this.http
      .get<{ status: string; data: { user: User } }>(
        `${this.apiUrl}/users/profile`
      )
      .pipe(
        map((response) => {
          if (response.data?.user) {
            // Update the current user data
            this.currentUserSubject.next(response.data.user);
            localStorage.setItem(
              'currentUser',
              JSON.stringify(response.data.user)
            );
            return true;
          }
          return false;
        }),
        catchError((error) => {
          if (error.status === 401) {
            // Token is invalid or expired
            this.signOut();
          }
          return of(false);
        })
      );
  }
}
