import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Event {
  id: number;
  title: string;
  date: Date | string;
  location: string;
  description: string;
  imageUrl: string;
  price: number;
  category: string;
  duration: string;
  organizer: string;
  availableTickets: number;
  schedule?: {
    day: string;
    events: {
      time: string;
      title: string;
    }[];
  }[];
}

@Injectable({
  providedIn: 'root',
})

export class EventService {
  private apiUrl = 'api/events'; // Replace with your actual API endpoint

  constructor(private http: HttpClient, private router: Router) {}

  // Get all events
  getEvents(): Observable<Event[]> {
    return this.http.get<{ events: Event[] }>('/assets/data/events.json')
      .pipe(
        map(response => response.events.map(event => ({
          ...event,
          date: new Date(event.date)
        }))),
        catchError(this.handleError)
      );
  }

  // Get a single event by ID
  getEvent(id: number): Observable<Event> {
    return this.http.get<{ events: Event[] }>('/assets/data/events.json')
      .pipe(
        map(response => {
          const event = response.events.find(e => e.id === id);
          if (event) {
            return {
              ...event,
              date: new Date(event.date)
            };
          }
          throw new Error(`Event with id ${id} not found`);
        }),
        catchError(this.handleError)
      );
  }

  // Create a new event
  createEvent(event: Omit<Event, 'id'>): Observable<Event> {
    // In a real implementation, this would make an HTTP POST request
    return throwError(() => new Error('Creating events requires a backend API implementation'));
  }

  // Update an existing event
  updateEvent(event: Event): Observable<Event> {
    // In a real implementation, this would make an HTTP PUT request
    return throwError(() => new Error('Updating events requires a backend API implementation'));
  }

  // Delete an event
  deleteEvent(id: number): Observable<void> {
    // In a real implementation, this would make an HTTP DELETE request
    return throwError(() => new Error('Deleting events requires a backend API implementation'));
  }

  viewEvent(eventId: number): void {
    this.router.navigate(['/events', eventId]);
  }

  // Error handling
  private handleError(error: any) {
    console.error('API error:', error);
    return throwError(() => error);
  }

  getEventMetadata(): Observable<{ locations: string[]; categories: string[] }> {
    return this.http.get<{ locations: string[]; categories: string[] }>('/assets/data/events-metadata.json');
  }
}
