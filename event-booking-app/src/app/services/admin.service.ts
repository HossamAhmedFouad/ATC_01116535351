import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Event {
  id: string; // UUID from backend
  title: string;
  date: Date;
  location?: string;
  description?: string;
  image_url?: string;
  price?: number;
  category?: string;
  duration?: string;
  organizer?: string;
  available_tickets?: number;
  schedule?: any;
  // UI-specific fields
  status?: 'active' | 'inactive';
  bookingsCount?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = environment.apiUrl || '/api';

  constructor(private http: HttpClient) {}

  // Helper method to build HTTP params safely
  private buildHttpParams(params: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return httpParams;
  }

  // EVENT MANAGEMENT

  /**
   * Get all events with admin privileges (includes all events regardless of status)
   */
  getAllEvents(params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    searchTerm?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): Observable<any> {
    const httpParams = this.buildHttpParams(params || {});
    return this.http.get(`${this.apiUrl}/events/admin`, { params: httpParams });
  }

  /**
   * Create a new event
   */
  createEvent(eventData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/events`, eventData);
  }
  /**
   * Update an existing event
   */
  updateEvent(id: string, eventData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/events/${id}`, eventData);
  }

  /**
   * Delete an event
   */
  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/events/${id}`);
  }

  /**
   * Cancel an event
   */
  cancelEvent(id: string, reason?: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/events/${id}/cancel`, { reason });
  }
  /**
   * Bulk update event status
   */
  bulkUpdateEventStatus(ids: string[], status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/events/bulk-update`, {
      ids,
      status,
    });
  }

  /**
   * Bulk delete events
   */
  bulkDeleteEvents(ids: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/events/bulk-delete`, { ids });
  }

  // BOOKING MANAGEMENT
  /**
   * Get all bookings (admin only)
   */
  getAllBookings(params?: {
    page?: number;
    limit?: number;
    status?: string;
    eventId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): Observable<any> {
    const httpParams = this.buildHttpParams(params || {});
    return this.http.get(`${this.apiUrl}/bookings/admin`, {
      params: httpParams,
    });
  }

  /**
   * Approve a booking
   */
  approveBooking(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/bookings/${id}/approve`, {});
  }

  /**
   * Reject a booking
   */
  rejectBooking(id: string, reason?: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/bookings/${id}/reject`, { reason });
  }

  // USER MANAGEMENT

  /**
   * Get all users (admin only)
   */
  getAllUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): Observable<any> {
    const httpParams = this.buildHttpParams(params || {});
    return this.http.get(`${this.apiUrl}/users`, { params: httpParams });
  }

  /**
   * Get admin dashboard statistics
   */
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/stats`);
  }

  /**
   * Export events to CSV (server-side generation)
   */
  exportEventsToCSV(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    searchTerm?: string;
  }): Observable<Blob> {
    const httpParams = this.buildHttpParams(params || {});

    return this.http.get(`${this.apiUrl}/events/export`, {
      params: httpParams,
      responseType: 'blob',
    });
  }
}
