import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { User } from './auth.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users'; // Adjust based on backend

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getCurrentUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  updateUserProfile(data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, data);
  }

  // Admin functions
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}`);
  }

  changeUserRole(userId: number, newRole: 'user' | 'admin'): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${userId}/role`, { role: newRole });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }

  // Optional: fetch current user's bookings
  getUserBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/me/bookings`);
  }

  // Example: Use AuthService to get the current user
  getCurrentUser(): User | null {
    return this.authService.getCurrentUser();
  }
}
