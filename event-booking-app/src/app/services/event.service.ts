import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';

export interface Event {
  id: string;
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
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`; // Uses environment configuration

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService
  ) {}

  // Get all events
  getEvents(category?: string): Observable<Event[]> {
    const url = category ? `${this.apiUrl}?category=${category}` : this.apiUrl;

    return this.http
      .get<{ status: string; results: number; data: { events: any[] } }>(url)
      .pipe(
        map((response) =>
          response.data.events.map((event) => ({
            ...event,
            date: new Date(event.date),
          }))
        ),
        catchError((error) => {
          this.toastService.error('Failed to load events');
          return this.handleError(error);
        })
      );
  }

  // Get a single event by ID
  getEvent(id: string): Observable<Event> {
    return this.http
      .get<{ status: string; data: { event: any } }>(`${this.apiUrl}/${id}`)
      .pipe(
        map((response) => ({
          ...response.data.event,
          date: new Date(response.data.event.date),
        })),
        catchError((error) => {
          this.toastService.error(`Failed to load event with ID ${id}`);
          return this.handleError(error);
        })
      );
  }

  // Search events
  searchEvents(query: string): Observable<Event[]> {
    return this.http
      .get<{ status: string; results: number; data: { events: any[] } }>(
        `${this.apiUrl}/search?query=${query}`
      )
      .pipe(
        map((response) =>
          response.data.events.map((event) => ({
            ...event,
            date: new Date(event.date),
          }))
        ),
        catchError((error) => {
          this.toastService.error('Failed to search events');
          return this.handleError(error);
        })
      );
  }
  // Create a new event (admin only)
  createEvent(event: Omit<Event, 'id'>): Observable<Event> {
    return this.http
      .post<{ status: string; data: { event: any } }>(this.apiUrl, event)
      .pipe(
        map((response) => ({
          ...response.data.event,
          date: new Date(response.data.event.date),
        })),
        catchError((error) => {
          this.toastService.error('Failed to create event');
          return this.handleError(error);
        })
      );
  }

  // Update an existing event (admin only)
  updateEvent(id: string, event: Partial<Event>): Observable<Event> {
    return this.http
      .patch<{ status: string; data: { event: any } }>(
        `${this.apiUrl}/${id}`,
        event
      )
      .pipe(
        map((response) => ({
          ...response.data.event,
          date: new Date(response.data.event.date),
        })),
        catchError((error) => {
          this.toastService.error('Failed to update event');
          return this.handleError(error);
        })
      );
  }

  // Delete an event (admin only)
  deleteEvent(id: string): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map(() => undefined),
      catchError((error) => {
        this.toastService.error('Failed to delete event');
        return this.handleError(error);
      })
    );
  }

  // Navigate to event details page
  viewEvent(eventId: number): void {
    this.router.navigate(['/events', eventId]);
  }

  // Error handling
  private handleError(error: any) {
    console.error('API error:', error);
    return throwError(() => error);
  }

  // Get metadata like locations and categories (we'll need to implement this in the backend)
  getEventMetadata(): Observable<{
    locations: string[];
    categories: string[];
  }> {
    // Ideally this would be an API endpoint, but for now we'll use the local data
    return this.http
      .get<{ locations: string[]; categories: string[] }>(
        '/assets/data/events-metadata.json'
      )
      .pipe(
        catchError((error) => {
          this.toastService.error('Failed to load event metadata');
          return this.handleError(error);
        })
      );
  }
}
