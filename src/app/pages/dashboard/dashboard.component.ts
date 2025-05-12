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
import { Booking } from '../../services/booking.service';
import { Event } from '../../services/event.service';
import { EventService } from '../../services/event.service';
import { forkJoin, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

interface BookedEvent extends Booking {
  eventDetails: Event;
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

import {
  SidebarNavComponent,
  NavItem,
} from '../../components/sidebar-nav/sidebar-nav.component';

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
  monthlyStats: { month: string; count: number; spending: number }[] = [];

  constructor(
    private authService: AuthService,
    private eventService: EventService,
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
            this.calculateMonthlyStats();
          },
          error: (err) => console.error('Failed to load events:', err),
        });
      }
    });
  }

  loadUserEvents(): Observable<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.bookedEvents) {
      this.bookedEvents = [];
      return of(undefined);
    }

    const observables = currentUser.bookedEvents.map((booking) =>
      this.eventService.getEvent(booking.event_id).pipe(
        map((eventDetails) => ({
          ...booking,
          eventDetails,
        })),
        catchError((error) => {
          console.error('Failed to load event details:', error);
          return of({
            ...booking,
            eventDetails: {} as Event,
          });
        })
      )
    );

    return forkJoin(observables).pipe(
      tap((bookedEvents) => {
        this.bookedEvents = bookedEvents;
      }),
      map(() => undefined)
    );
  }

  calculateStats() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    this.eventStats = {
      totalEvents: this.bookedEvents.length,
      upcomingEvents: this.bookedEvents.filter(
        (e) => new Date(e.booking_time) > now && e.status === 'booked'
      ).length,
      completedEvents: this.bookedEvents.filter(
        (e) => new Date(e.booking_time) <= now && e.status === 'booked'
      ).length,
      cancelledEvents: this.bookedEvents.filter((e) => e.status === 'cancelled')
        .length,
      totalSpent: this.bookedEvents.reduce(
        (sum, event) => sum + event.total_price,
        0
      ),
      favoriteCategory: this.getFavoriteCategory(),
      monthlySpending: this.bookedEvents
        .filter((e) => new Date(e.booking_time) >= monthStart)
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
    switch (status) {
      case 'upcoming':
        return 'status-upcoming';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
    // TODO: Implement actual cancellation logic with API call
    const index = this.bookedEvents.findIndex((e) => e.id === event.id);
    if (index !== -1) {
      this.bookedEvents[index].status = 'cancelled';
      this.calculateStats();
      this.calculateCategoryStats();
      this.snackBar.open('Event booking cancelled successfully', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    }
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
    this.upcomingEventsPreview = this.bookedEvents
      .filter(
        (event) => event.status === 'booked' && event.eventDetails.date > now
      )
      .sort(
        (a, b) => a.eventDetails.date.getTime() - b.eventDetails.date.getTime()
      )
      .slice(0, 3);
  }

  generateRecentActivity() {
    const now = new Date();
    this.recentActivity = this.bookedEvents
      .map((event) => {
        const activities = [];
        if (event.status === 'booked' || event.status === 'cancelled') {
          activities.push({
            type: event.status,
            event,
            date: event.eventDetails?.date || now,
          });
        }
        return activities;
      })
      .flat()
      .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0))
      .slice(0, 5);
  }

  calculateMonthlyStats() {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return {
        month: date.toLocaleString('default', { month: 'short' }),
        count: 0,
        spending: 0,
      };
    }).reverse();

    this.bookedEvents.forEach((event) => {
      const eventMonth = event.eventDetails.date.getMonth();
      const eventYear = event.eventDetails.date.getFullYear();
      const monthIndex = months.findIndex((m) => {
        const monthDate = new Date(eventYear, eventMonth, 1);
        return (
          monthDate.getMonth() === eventMonth &&
          monthDate.getFullYear() === eventYear
        );
      });

      if (monthIndex !== -1) {
        months[monthIndex].count++;
        months[monthIndex].spending += event.total_price;
      }
    });

    this.monthlyStats = months;
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'completed':
        return 'check_circle';
      case 'cancelled':
        return 'cancel';
      default:
        return 'event';
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'completed':
        return 'var(--success-color)';
      case 'cancelled':
        return 'var(--error-color)';
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

  getBarHeight(spending: number): number {
    const maxSpending = Math.max(
      ...this.monthlyStats.map((stat) => stat.spending)
    );
    if (maxSpending === 0) return 0;
    // Calculate height as a percentage of the maximum spending
    // Using 80% of the chart height as maximum to leave space for labels
    return Math.max((spending / maxSpending) * 80, 4); // Minimum 4% height
  }

  getTotalEvents(): number {
    return this.monthlyStats.reduce((sum, stat) => sum + stat.count, 0);
  }

  getTotalSpending(): number {
    return this.monthlyStats.reduce((sum, stat) => sum + stat.spending, 0);
  }

  getAverageSpending(): number {
    const totalSpending = this.getTotalSpending();
    const monthsWithSpending = this.monthlyStats.filter(
      (stat) => stat.spending > 0
    ).length;
    return monthsWithSpending > 0 ? totalSpending / monthsWithSpending : 0;
  }
}
