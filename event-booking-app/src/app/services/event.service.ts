import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';
import { CacheService } from './cache.service';

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
  // Default TTL of 5 minutes for event data
  private defaultTtl = 300000;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService,
    private cacheService: CacheService
  ) {}
  // Get all events
  getEvents(category?: string): Observable<Event[]> {
    const url = category ? `${this.apiUrl}?category=${category}` : this.apiUrl;
    const cacheKey = `events_${category || 'all'}`;

    // Check if we have cached data
    const cachedData = this.cacheService.get<Event[]>(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    // No cached data, make the HTTP request
    return this.http
      .get<{ status: string; results: number; data: { events: any[] } }>(url)
      .pipe(
        map((response) =>
          response.data.events.map((event) => ({
            ...event,
            date: new Date(event.date),
          }))
        ),
        tap((events) => {
          // Cache the result
          this.cacheService.set(cacheKey, events, this.defaultTtl);
        }),
        catchError((error) => {
          this.toastService.error('Failed to load events');
          return this.handleError(error);
        })
      );
  }
  // Get a single event by ID
  getEvent(id: string): Observable<Event> {
    const cacheKey = `event_${id}`;

    // Check if we have cached data
    const cachedData = this.cacheService.get<Event>(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    // No cached data, make the HTTP request
    return this.http
      .get<{ status: string; data: { event: any } }>(`${this.apiUrl}/${id}`)
      .pipe(
        map((response) => ({
          ...response.data.event,
          date: new Date(response.data.event.date),
        })),
        tap((event) => {
          // Cache the result
          this.cacheService.set(cacheKey, event, this.defaultTtl);
        }),
        catchError((error) => {
          this.toastService.error(`Failed to load event with ID ${id}`);
          return this.handleError(error);
        })
      );
  }
  // Search events
  searchEvents(query: string): Observable<Event[]> {
    const cacheKey = `search_${query}`;

    // Check if we have cached data
    const cachedData = this.cacheService.get<Event[]>(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

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
        tap((events) => {
          // Cache the result - shorter TTL for search results (2 minutes)
          this.cacheService.set(cacheKey, events, 120000);
        }),
        catchError((error) => {
          this.toastService.error('Failed to search events');
          return this.handleError(error);
        })
      );
  } // Create a new event (admin only)
  createEvent(event: Omit<Event, 'id'>): Observable<Event> {
    return this.http
      .post<{ status: string; data: { event: any } }>(this.apiUrl, event)
      .pipe(
        map((response) => ({
          ...response.data.event,
          date: new Date(response.data.event.date),
        })),
        tap(() => {
          // Invalidate the events list cache
          this.cacheService.clearWithPrefix('events_');
        }),
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
        tap((updatedEvent) => {
          // Invalidate specific event cache
          this.cacheService.remove(`event_${id}`);
          // Invalidate events list cache as it contains this event
          this.cacheService.clearWithPrefix('events_');
          // Update the cache with the new event data
          this.cacheService.set(`event_${id}`, updatedEvent, this.defaultTtl);
        }),
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
      tap(() => {
        // Invalidate specific event cache
        this.cacheService.remove(`event_${id}`);
        // Invalidate events list cache as it no longer contains this event
        this.cacheService.clearWithPrefix('events_');
      }),
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
    const cacheKey = 'event_metadata';

    // Check if we have cached data
    const cachedData = this.cacheService.get<{
      locations: string[];
      categories: string[];
    }>(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    // Ideally this would be an API endpoint, but for now we'll use the local data
    return this.http
      .get<{ locations: string[]; categories: string[] }>(
        '/assets/data/events-metadata.json'
      )
      .pipe(
        tap((metadata) => {
          // Cache metadata for longer (1 hour) since it changes infrequently
          this.cacheService.set(cacheKey, metadata, 3600000);
        }),
        catchError((error) => {
          this.toastService.error('Failed to load event metadata');
          return this.handleError(error);
        })
      );
  }
}
