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
}
