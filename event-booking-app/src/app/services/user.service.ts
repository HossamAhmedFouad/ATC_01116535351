import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError, of, tap } from 'rxjs';
import { User } from './auth.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`; // Uses environment configuration
  // Default TTL of 10 minutes for user data
  private defaultTtl = 600000;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService,
    private cacheService: CacheService
  ) {}
  /**
   * Get the current user's profile from the API
   */
  getCurrentUserProfile(): Observable<User> {
    const cacheKey = 'current_user_profile';

    // Check if we have cached data
    const cachedData = this.cacheService.get<User>(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    return this.http
      .get<{ status: string; data: { user: User } }>(`${this.apiUrl}/profile`)
      .pipe(
        map((response) => response.data.user),
        tap((user) => {
          // Cache the result
          this.cacheService.set(cacheKey, user, this.defaultTtl);
          // Update auth service with fresh data
          this.updateAuthServiceUser(user);
        }),
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
        tap((updatedUser) => {
          // Update cached user profile
          this.cacheService.set(
            'current_user_profile',
            updatedUser,
            this.defaultTtl
          );
          // Update auth service with fresh data
          this.updateAuthServiceUser(updatedUser);
        }),
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
  /**
   * Change the user's password
   * @param currentPassword The user's current password
   * @param newPassword The new password to set
   */ changePassword(
    currentPassword: string,
    newPassword: string
  ): Observable<void> {
    return this.http
      .post<{ status: string; data: { message: string } }>(
        `${this.apiUrl}/change-password`,
        {
          currentPassword,
          newPassword,
        }
      )
      .pipe(
        map((response) => {
          if (response.status !== 'success') {
            throw new Error('Failed to change password');
          }
          this.toastService.success(response.data.message);
        }),
        catchError((error) => {
          this.toastService.error(
            error.error?.message || 'Failed to change password'
          );
          return throwError(
            () => new Error(error.error?.message || 'Failed to change password')
          );
        })
      );
  }

  /**
   * Helper method to update the AuthService user data
   */
  private updateAuthServiceUser(userData: Partial<User>): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      // Update auth service and localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      this.authService['currentUserSubject'].next(updatedUser);
    }
  }
}
