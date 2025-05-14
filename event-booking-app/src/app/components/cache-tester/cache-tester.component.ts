import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event.service';
import { BookingService } from '../../services/booking.service';
import { UserService } from '../../services/user.service';
import { CacheService } from '../../services/cache.service';
import { Event } from '../../services/event.service';

@Component({
  selector: 'app-cache-tester',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cache-tester">
      <h2>Cache Testing Utility</h2>

      <div class="test-section">
        <h3>Events Cache Test</h3>
        <button (click)="testEventsCache()">Load Events (Check Console)</button>
        <button (click)="clearEventCache()">Clear Events Cache</button>
        <div *ngIf="events.length > 0">Loaded {{ events.length }} events</div>
      </div>

      <div class="test-section">
        <h3>User Profile Cache Test</h3>
        <button (click)="testUserProfileCache()">
          Load User Profile (Check Console)
        </button>
        <button (click)="clearUserCache()">Clear User Cache</button>
      </div>

      <div class="test-section">
        <h3>Bookings Cache Test</h3>
        <button (click)="testBookingsCache()">
          Load Bookings (Check Console)
        </button>
        <button (click)="clearBookingCache()">Clear Bookings Cache</button>
      </div>

      <div class="test-section">
        <h3>Cache Statistics</h3>
        <button (click)="getCacheStats()">Show Cache Stats</button>
        <div *ngIf="cacheStats">
          <pre>{{ cacheStats | json }}</pre>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .cache-tester {
        padding: 20px;
        background-color: #f5f5f5;
        border-radius: 8px;
        max-width: 800px;
        margin: 20px auto;
      }

      .test-section {
        margin-bottom: 20px;
        padding: 15px;
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      h2 {
        margin-top: 0;
        color: #333;
      }

      h3 {
        margin-top: 0;
        color: #555;
      }

      button {
        background-color: #4f46e5;
        color: white;
        border: none;
        padding: 8px 16px;
        margin-right: 8px;
        margin-bottom: 8px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s;
      }

      button:hover {
        background-color: #4338ca;
      }

      pre {
        background-color: #f8f8f8;
        padding: 10px;
        border-radius: 4px;
        overflow: auto;
        max-height: 200px;
      }
    `,
  ],
})
export class CacheTesterComponent implements OnInit {
  events: Event[] = [];
  cacheStats: any = null;

  constructor(
    private eventService: EventService,
    private bookingService: BookingService,
    private userService: UserService,
    private cacheService: CacheService
  ) {}

  ngOnInit(): void {
    console.log('Cache Tester Component Initialized');
  }

  // Test Events Cache
  testEventsCache(): void {
    console.log('Testing Events Cache - First Request:');
    console.time('First Request');

    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = events;
        console.timeEnd('First Request');
        console.log(`Received ${events.length} events`);

        // Make a second request immediately, which should be cached
        console.log(
          'Testing Events Cache - Second Request (should be cached):'
        );
        console.time('Second Request');

        this.eventService.getEvents().subscribe({
          next: (cachedEvents) => {
            console.timeEnd('Second Request');
            console.log(`Received ${cachedEvents.length} events from cache`);
          },
          error: (error) => console.error('Error in second request:', error),
        });
      },
      error: (error) => console.error('Error in first request:', error),
    });
  }

  // Test User Profile Cache
  testUserProfileCache(): void {
    console.log('Testing User Profile Cache - First Request:');
    console.time('User Profile First Request');

    this.userService.getCurrentUserProfile().subscribe({
      next: (user) => {
        console.timeEnd('User Profile First Request');
        console.log('User profile:', user);

        // Make a second request immediately, which should be cached
        console.log(
          'Testing User Profile Cache - Second Request (should be cached):'
        );
        console.time('User Profile Second Request');

        this.userService.getCurrentUserProfile().subscribe({
          next: (cachedUser) => {
            console.timeEnd('User Profile Second Request');
            console.log('User profile from cache:', cachedUser);
          },
          error: (error) =>
            console.error('Error in second user request:', error),
        });
      },
      error: (error) => console.error('Error in first user request:', error),
    });
  }

  // Test Bookings Cache
  testBookingsCache(): void {
    console.log('Testing Bookings Cache - First Request:');
    console.time('Bookings First Request');

    this.bookingService.getUserBookings().subscribe({
      next: (bookings) => {
        console.timeEnd('Bookings First Request');
        console.log(`Received ${bookings.length} bookings`);

        // Make a second request immediately, which should be cached
        console.log(
          'Testing Bookings Cache - Second Request (should be cached):'
        );
        console.time('Bookings Second Request');

        this.bookingService.getUserBookings().subscribe({
          next: (cachedBookings) => {
            console.timeEnd('Bookings Second Request');
            console.log(
              `Received ${cachedBookings.length} bookings from cache`
            );
          },
          error: (error) =>
            console.error('Error in second bookings request:', error),
        });
      },
      error: (error) =>
        console.error('Error in first bookings request:', error),
    });
  }

  // Clear specific cache types
  clearEventCache(): void {
    this.cacheService.clearWithPrefix('events_');
    this.cacheService.clearWithPrefix('event_');
    console.log('Events cache cleared');
  }

  clearUserCache(): void {
    this.cacheService.remove('current_user_profile');
    console.log('User cache cleared');
  }

  clearBookingCache(): void {
    this.cacheService.remove('user_bookings');
    this.cacheService.clearWithPrefix('booking_');
    console.log('Bookings cache cleared');
  }

  // Show Cache Statistics
  getCacheStats(): void {
    // Get detailed stats from our enhanced CacheService
    const stats = this.cacheService.getStats();
    this.cacheStats = stats;
    console.log('Cache statistics:', stats);
  }

  // Helper to extract prefix from key
  private getKeyPrefix(key: string): string {
    const parts = key.split('_');
    return parts[0] || 'unknown';
  }
}
