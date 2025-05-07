import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { delay, tap } from 'rxjs/operators';

export interface User {
  id?: string;
  name: string;
  username: string;
  email: string;
  location?: string;
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
    return of({
      user: {
        id: '1',
        name: 'Test User',
        username: 'testuser',
        email: email,
        location: 'San Francisco, CA'
      },
      token: 'mock-jwt-token'
    }).pipe(
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
    return of({
      user: {
        id: '1',
        ...userData
      },
      token: 'mock-jwt-token'
    }).pipe(
      delay(1000), // Simulate network delay
      tap(response => this.handleAuthResponse(response))
    );
  }

  signInWithGoogle(): Observable<AuthResponse> {
    // For development, simulate API call
    return of({
      user: {
        id: '1',
        name: 'Google User',
        username: 'googleuser',
        email: 'google@example.com',
        location: 'San Francisco, CA'
      },
      token: 'mock-jwt-token'
    }).pipe(
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