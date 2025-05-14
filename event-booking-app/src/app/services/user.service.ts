import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { User } from './auth.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`; // Uses environment configuration

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  /**
   * Get the current user's profile from the API
   */
  getCurrentUserProfile(): Observable<User> {
    return this.http
      .get<{ status: string; data: { user: User } }>(`${this.apiUrl}/profile`)
      .pipe(
        map((response) => response.data.user),
        catchError((error) => {
          this.toastService.error('Failed to load profile');
          return throwError(
            () => new Error(error.error?.message || 'Failed to load profile')
          );
        })
      );
  }

  /**
   * Update the current user's profile
   */
  updateUserProfile(data: Partial<User>): Observable<User> {
    return this.http
      .patch<{ status: string; data: { user: User } }>(
        `${this.apiUrl}/profile`,
        data
      )
      .pipe(
        map((response) => response.data.user),
        catchError((error) => {
          this.toastService.error('Failed to update profile');
          return throwError(
            () => new Error(error.error?.message || 'Failed to update profile')
          );
        })
      );
  }

  // Admin functions
  /**
   * Get all users (admin only)
   */
  getAllUsers(): Observable<User[]> {
    return this.http
      .get<{ status: string; data: { users: User[] } }>(`${this.apiUrl}`)
      .pipe(
        map((response) => response.data.users),
        catchError((error) => {
          this.toastService.error('Failed to fetch users');
          return throwError(
            () => new Error(error.error?.message || 'Failed to fetch users')
          );
        })
      );
  }

  /**
   * Get the current user from local storage (via AuthService)
   */
  getCurrentUser(): User | null {
    return this.authService.getCurrentUser();
  }
}
