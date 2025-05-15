import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule, MatCalendar } from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_LOCALE as MAT_DATE_LOCALE_2,
} from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import moment from 'moment';
import { Booking, BookingService } from '../../services/booking.service';
import { Event } from '../../services/event.service';
import { EventService } from '../../services/event.service';
import { forkJoin, Observable, of } from 'rxjs';
import { map, tap, catchError, switchMap, finalize } from 'rxjs/operators';
import { LoaderComponent } from '../../components/loader/loader.component';

interface BookedEvent extends Booking {
  eventDetails: Event;
  isCancelling?: boolean;
}

interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  totalSpent: number;
  favoriteCategory: string;
  monthlySpending: number;
  yearlySpending: number;
  averageTicketPrice: number;
  mostExpensiveEvent: BookedEvent;
  upcomingSpending: number;
}

interface CategoryStats {
  category: string;
  count: number;
  totalSpent: number;
  percentage: number;
}

interface EventCategory {
  name: string;
  count: number;
  color: string;
  icon: string;
}

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatBadgeModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    MatListModule,
    MatMenuModule,
    LoaderComponent,
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
    { provide: MAT_DATE_LOCALE_2, useValue: 'en-US' },
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  @ViewChild('calendar') calendar?: MatCalendar<Date>;
  currentUser: User | null = null;
  currentDate: Date = new Date();
  bookedEvents: BookedEvent[] = [];
  selectedDate: Date | null = null;
  minDate: Date = new Date();
  maxDate: Date = new Date(new Date().getFullYear() + 1, 11, 31);
  eventStats: EventStats = {
    totalEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    cancelledEvents: 0,
    totalSpent: 0,
    favoriteCategory: '',
    monthlySpending: 0,
    yearlySpending: 0,
    averageTicketPrice: 0,
    mostExpensiveEvent: {} as BookedEvent,
    upcomingSpending: 0,
  };
  categories: string[] = [
    'All',
    'Music',
    'Sports',
    'Technology',
    'Food',
    'Arts',
  ];
  selectedCategory: string = 'All';
  categoryStats: CategoryStats[] = [];
  viewMode: 'grid' | 'list' = 'grid';
  sortBy: 'date' | 'price' | 'name' = 'date';
  sortOrder: 'asc' | 'desc' = 'asc';
  currentPage: number = 1;
  itemsPerPage: number = 2;
  totalPages: number = 1;
  isDateFiltered: boolean = false;

  eventCategories: EventCategory[] = [
    { name: 'Music', count: 0, color: '#7c3aed', icon: 'music_note' },
    { name: 'Sports', count: 0, color: '#16a34a', icon: 'sports_soccer' },
    { name: 'Technology', count: 0, color: '#2563eb', icon: 'computer' },
    { name: 'Food', count: 0, color: '#ea580c', icon: 'restaurant' },
    { name: 'Arts', count: 0, color: '#db2777', icon: 'palette' },
  ];
  upcomingEventsPreview: BookedEvent[] = [];
  recentActivity: { type: string; event: BookedEvent; date: Date }[] = [];
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private bookingService: BookingService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.loadUserEvents().subscribe({
          next: () => {
            this.calculateStats();
            this.calculateCategoryStats();
            this.updateUpcomingEventsPreview();
            this.generateRecentActivity();
          },
          error: (err) => console.error('Failed to load events:', err),
        });
      }
    });
  }
  loadUserEvents(forceRefresh: boolean = false): Observable<void> {
    this.isLoading = true;

    // If force refresh is requested, clear the cached bookings first
    if (forceRefresh) {
      this.bookingService.clearCache('user_bookings');
    }

    return this.bookingService.getUserBookings().pipe(
      switchMap((bookings: Booking[]) => {
        if (!bookings || bookings.length === 0) {
          this.bookedEvents = [];
          return of(undefined);
        }

        const observables = bookings.map((booking: Booking) =>
          this.eventService.getEvent(booking.event_id).pipe(
            map(
              (eventDetails) =>
                ({
                  ...booking,
                  eventDetails,
                } as BookedEvent)
            ),
            catchError((error) => {
              console.error('Failed to load event details:', error);
              return of({
                ...booking,
                eventDetails: {} as Event,
              } as BookedEvent);
            })
          )
        );

        return forkJoin(observables).pipe(
          tap((bookedEvents: BookedEvent[]) => {
            // Process the bookings to normalize status
            this.bookedEvents = bookedEvents.map((event) => {
              // If it's a booking that has not been explicitly cancelled, mark it as upcoming
              if (event.status === 'CONFIRMED' || event.status === 'booked') {
                // Check if the event date is in the past
                const eventDate = new Date(event.eventDetails.date);
                const now = new Date();

                if (eventDate < now) {
                  event.status = 'completed';
                } else {
                  event.status = 'upcoming';
                }
              } else if (event.status === 'CANCELLED') {
                event.status = 'cancelled';
              }

              return event;
            });
          }),
          map(() => undefined)
        );
      }),
      catchError((error) => {
        console.error('Failed to load user bookings:', error);
        this.bookedEvents = [];
        return of(undefined);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    );
  }
  calculateStats() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // Filter only non-cancelled bookings for active stats
    const activeBookings = this.bookedEvents.filter(
      (e) => e.status !== 'cancelled' && e.status !== 'CANCELLED'
    );

    this.eventStats = {
      totalEvents: activeBookings.length,
      upcomingEvents: activeBookings.filter(
        (e) => new Date(e.eventDetails.date) > now
      ).length,
      completedEvents: activeBookings.filter(
        (e) => new Date(e.eventDetails.date) <= now
      ).length,
      cancelledEvents: this.bookedEvents.filter(
        (e) => e.status === 'cancelled' || e.status === 'CANCELLED'
      ).length,
      totalSpent: activeBookings.reduce(
        (sum, event) => sum + event.total_price,
        0
      ),
      favoriteCategory: this.getFavoriteCategory(),
      monthlySpending: activeBookings
        .filter((e) => new Date(e.eventDetails.date) >= monthStart)
        .reduce((sum, event) => sum + event.total_price, 0),
      yearlySpending: this.bookedEvents
        .filter((e) => new Date(e.booking_time) >= yearStart)
        .reduce((sum, event) => sum + event.total_price, 0),
      averageTicketPrice:
        this.bookedEvents.length > 0
          ? this.bookedEvents.reduce(
              (sum, event) => sum + event.total_price,
              0
            ) / this.bookedEvents.length
          : 0,
      mostExpensiveEvent: this.bookedEvents.reduce(
        (max, event) => (event.total_price > max.total_price ? event : max),
        { total_price: 0 } as BookedEvent
      ),
      upcomingSpending: this.bookedEvents
        .filter((e) => new Date(e.booking_time) > now && e.status === 'booked')
        .reduce((sum, event) => sum + event.total_price, 0),
    };
    console.log(this.eventStats);
    console.log(this.bookedEvents);
  }

  calculateCategoryStats() {
    const categoryMap = new Map<
      string,
      { count: number; totalSpent: number }
    >();

    this.bookedEvents.forEach((event) => {
      const current = categoryMap.get(
        event.eventDetails?.category || 'Unknown'
      ) || { count: 0, totalSpent: 0 };
      categoryMap.set(event.eventDetails?.category || 'Unknown', {
        count: current.count + 1,
        totalSpent: current.totalSpent + event.total_price,
      });
    });

    const totalEvents = this.bookedEvents.length;
    const totalSpent = this.eventStats.totalSpent;

    this.categoryStats = Array.from(categoryMap.entries())
      .map(([category, stats]) => ({
        category,
        count: stats.count,
        totalSpent: stats.totalSpent,
        percentage: (stats.count / totalEvents) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }

  getFavoriteCategory(): string {
    const categoryCount = this.bookedEvents.reduce((acc, event) => {
      acc[event.eventDetails?.category || 'Unknown'] =
        (acc[event.eventDetails?.category || 'Unknown'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      'None'
    );
  }

  filterEventsByCategory(category: string) {
    this.selectedCategory = category;
    this.currentPage = 1; // Reset to first page when filtering
  }

  getFilteredEvents(): BookedEvent[] {
    let events = this.bookedEvents;

    // Apply date filter if a date is selected
    if (this.isDateFiltered && this.selectedDate) {
      events = events.filter((event) =>
        moment(event.eventDetails?.date).isSame(this.selectedDate, 'day')
      );
    }

    // Apply category filter
    if (this.selectedCategory !== 'All') {
      events = events.filter(
        (event) => event.eventDetails?.category === this.selectedCategory
      );
    }

    // Sort events
    events = [...events].sort((a, b) => {
      let comparison = 0;
      switch (this.sortBy) {
        case 'date':
          comparison =
            a.eventDetails.date.getTime() - b.eventDetails.date.getTime();
          break;
        case 'price':
          comparison = a.total_price - b.total_price;
          break;
        case 'name':
          comparison = a.eventDetails.title.localeCompare(b.eventDetails.title);
          break;
      }
      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    return events;
  }

  toggleSortOrder() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
  }

  setSortBy(sortBy: 'date' | 'price' | 'name') {
    if (this.sortBy === sortBy) {
      this.toggleSortOrder();
    } else {
      this.sortBy = sortBy;
      this.sortOrder = 'asc';
    }
    this.currentPage = 1; // Reset to first page when sorting
  }
  getEventStatusClass(status: string): string {
    const normalizedStatus = this.getNormalizedStatus(status);

    switch (normalizedStatus) {
      case 'upcoming':
        return 'status-upcoming';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  }
  getStatusIcon(status: string): string {
    const normalizedStatus = this.getNormalizedStatus(status);

    switch (normalizedStatus) {
      case 'upcoming':
        return 'event_available';
      case 'completed':
        return 'task_alt';
      case 'cancelled':
        return 'event_busy';
      default:
        return 'help';
    }
  }

  formatDate(date: Date): string {
    return moment(date).format('ddd, MMM D, YYYY');
  }

  formatTime(date: Date): string {
    return moment(date).format('h:mm A');
  }

  formatCurrency(amount: number): string {
    // Use compact notation for large numbers
    if (amount >= 1000) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(amount);
    }

    // Use standard notation for smaller numbers
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  onDateSelected(date: Date | null) {
    this.selectedDate = date;
    this.isDateFiltered = date !== null;
    this.currentPage = 1; // Reset to first page when filtering
  }

  getEventsForDate(date: Date): BookedEvent[] {
    return this.bookedEvents.filter((event) =>
      moment(event.eventDetails.date).isSame(date, 'day')
    );
  }
  hasEventsOnDate = (date: Date): string => {
    return this.getEventsForDate(date).length > 0 ? 'has-events' : '';
  };
  cancelEvent(event: BookedEvent) {
    // Set a cancelling flag on this specific event to disable the button
    event.isCancelling = true;

    this.bookingService.cancelBooking(event.id).subscribe({
      next: (updatedBooking) => {
        // Refresh all dashboard data from the server
        this.loadUserEvents(true).subscribe({
          next: () => {
            // Recalculate all stats after refresh
            this.calculateStats();
            this.calculateCategoryStats();
            this.updateUpcomingEventsPreview();
            this.generateRecentActivity();

            this.snackBar.open(
              'Event booking cancelled successfully',
              'Close',
              {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
              }
            );
          },
          error: (err) => {
            console.error('Failed to refresh data after cancellation:', err);
            // Reset the cancelling flag on error
            event.isCancelling = false;
          },
        });
      },
      error: (error) => {
        console.error('Failed to cancel booking:', error);

        // Reset the cancelling flag on error
        event.isCancelling = false;

        this.snackBar.open(
          'Failed to cancel booking. Please try again.',
          'Close',
          {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-toast'],
          }
        );
      },
    });
  }

  getProgressColor(progress: number): string {
    if (progress >= 75) return 'success';
    if (progress >= 50) return 'primary';
    if (progress >= 25) return 'accent';
    return 'warn';
  }

  getPaginatedEvents(): BookedEvent[] {
    const filteredEvents = this.getFilteredEvents();
    this.totalPages = Math.ceil(filteredEvents.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return filteredEvents.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  clearDateFilter() {
    this.selectedDate = null;
    this.isDateFiltered = false;
    this.currentPage = 1;
  }

  goToToday() {
    const today = new Date();
    this.selectedDate = today;
    this.isDateFiltered = true;
    this.currentPage = 1;

    // Force calendar to update to current month and date
    if (this.calendar) {
      // First set the active date to trigger the view update
      this.calendar.activeDate = today;

      // Force a re-render by temporarily setting selected to null and back
      setTimeout(() => {
        if (this.calendar) {
          this.calendar.selected = null;
          setTimeout(() => {
            if (this.calendar) {
              this.calendar.selected = today;
            }
          });
        }
      });
    }
  }
  updateUpcomingEventsPreview() {
    const now = new Date();
    // Filter events that are confirmed/booked/upcoming and in the future
    this.upcomingEventsPreview = this.bookedEvents
      .filter(
        (event) =>
          event.status === 'booked' ||
          event.status === 'upcoming' ||
          event.status === 'CONFIRMED' ||
          this.getNormalizedStatus(event.status) === 'upcoming'
      )
      .filter((event) => new Date(event.eventDetails.date) > now) // Ensure event is in the future
      .sort(
        (a, b) =>
          new Date(a.eventDetails.date).getTime() -
          new Date(b.eventDetails.date).getTime()
      )
      .slice(0, 5); // Show more upcoming events (increased from 3 to 5)
  }
  generateRecentActivity() {
    const now = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14); // Show activities from last two weeks

    // Create a list of activities from bookings
    const activities = this.bookedEvents.flatMap((event) => {
      const result = [];

      // Add booking activity
      if (event.booking_time) {
        result.push({
          type: 'booked',
          event,
          date: new Date(event.booking_time),
          actionText: 'Booked on',
        });
      }

      // Add cancellation activity if the event was cancelled
      if (event.status === 'cancelled' || event.status === 'CANCELLED') {
        result.push({
          type: 'cancelled',
          event,
          date: new Date(event.updated_at), // Use updated_at for cancellation date
          actionText: 'Cancelled on',
        });
      }

      // Add upcoming event notification for events happening soon (within next 3 days)
      const eventDate = new Date(event.eventDetails.date);
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      if (
        (event.status === 'booked' || event.status === 'CONFIRMED') &&
        eventDate > now &&
        eventDate < threeDaysFromNow
      ) {
        result.push({
          type: 'upcoming',
          event,
          date: eventDate,
          actionText: 'Coming up on',
        });
      }

      return result;
    });

    // Sort by date (most recent first) and limit to 5 activities
    this.recentActivity = activities
      .filter((activity) => activity.date >= twoWeeksAgo) // Only show recent activities
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  }
  getActivityIcon(type: string): string {
    switch (type) {
      case 'completed':
      case 'booked':
        return 'check_circle';
      case 'cancelled':
        return 'cancel';
      case 'upcoming':
        return 'event_upcoming';
      default:
        return 'event';
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'completed':
      case 'booked':
        return 'var(--success-color)';
      case 'cancelled':
        return 'var(--error-color)';
      case 'upcoming':
        return '#2196F3'; // Blue for upcoming events
      default:
        return 'var(--primary-color)';
    }
  }

  formatMonthYear(date: Date): string {
    return moment(date).format('MMM YYYY');
  }

  getCategoryColor(category: string): string {
    const categoryInfo = this.eventCategories.find((c) => c.name === category);
    return categoryInfo?.color || 'var(--primary-color)';
  }

  getCategoryIcon(category: string): string {
    const categoryInfo = this.eventCategories.find((c) => c.name === category);
    return categoryInfo?.icon || 'event';
  }

  getFormattedStatus(status: string): string {
    const normalizedStatus = this.getNormalizedStatus(status);

    switch (normalizedStatus) {
      case 'upcoming':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status
          ? status.charAt(0).toUpperCase() + status.slice(1)
          : 'Unknown';
    }
  }

  /**
   * Normalizes the event status from various backend formats
   * @param status The status string from the backend
   * @returns A normalized status string
   */
  getNormalizedStatus(status: string): string {
    if (!status) return 'unknown';

    // Convert to lowercase for case-insensitive comparison
    const lowercaseStatus = status.toLowerCase();

    if (lowercaseStatus === 'confirmed' || lowercaseStatus === 'booked') {
      return 'upcoming';
    } else if (
      lowercaseStatus === 'cancelled' ||
      lowercaseStatus === 'canceled'
    ) {
      return 'cancelled';
    } else {
      return lowercaseStatus;
    }
  }
}
