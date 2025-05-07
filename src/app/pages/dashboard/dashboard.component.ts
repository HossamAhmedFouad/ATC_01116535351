import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule, MatCalendar } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE as MAT_DATE_LOCALE_2 } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import moment from 'moment';

interface BookedEvent {
  id: number;
  title: string;
  date: Date;
  location: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  ticketType: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  attendees: number;
  organizer: string;
  progress?: number;
  tags?: string[];
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
    MatTooltipModule
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
    { provide: MAT_DATE_LOCALE_2, useValue: 'en-US' }
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
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
    upcomingSpending: 0
  };
  categories: string[] = ['All', 'Music', 'Sports', 'Technology', 'Food', 'Arts'];
  selectedCategory: string = 'All';
  categoryStats: CategoryStats[] = [];
  viewMode: 'grid' | 'list' = 'grid';
  sortBy: 'date' | 'price' | 'name' = 'date';
  sortOrder: 'asc' | 'desc' = 'asc';
  currentPage: number = 1;
  itemsPerPage: number = 2;
  totalPages: number = 1;
  isDateFiltered: boolean = false;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadUserEvents();
        this.calculateStats();
        this.calculateCategoryStats();
      }
    });
  }

  loadUserEvents() {
    // TODO: Replace with actual API call
    // This is mock data for demonstration
    this.bookedEvents = [
      {
        id: 1,
        title: 'Tech Conference 2024',
        date: new Date('2024-03-15'),
        location: 'San Francisco, CA',
        status: 'upcoming',
        ticketType: 'VIP Pass',
        price: 299,
        category: 'Technology',
        description: 'Join us for the biggest tech conference of the year featuring AI, Cloud Computing, and more.',
        imageUrl: 'assets/images/tech-conference.jpg',
        attendees: 1500,
        organizer: 'Tech Events Inc.',
        progress: 75,
        tags: ['AI', 'Cloud', 'Networking']
      },
      {
        id: 2,
        title: 'Summer Music Festival',
        date: new Date('2024-04-20'),
        location: 'Austin, TX',
        status: 'upcoming',
        ticketType: 'General Admission',
        price: 199,
        category: 'Music',
        description: 'A three-day music festival featuring top artists from around the world.',
        imageUrl: 'assets/images/music-festival.jpg',
        attendees: 5000,
        organizer: 'Music Festivals Co.',
        progress: 60,
        tags: ['Live Music', 'Festival', 'Outdoor']
      },
      {
        id: 3,
        title: 'Food & Wine Expo',
        date: new Date('2024-05-05'),
        location: 'Chicago, IL',
        status: 'upcoming',
        ticketType: 'Premium Pass',
        price: 149,
        category: 'Food',
        description: 'Experience the finest cuisines and wines from renowned chefs and wineries.',
        imageUrl: 'assets/images/food-expo.jpg',
        attendees: 2000,
        organizer: 'Gourmet Events',
        progress: 45,
        tags: ['Food', 'Wine', 'Culinary']
      },
      {
        id: 4,
        title: 'Basketball Championship',
        date: new Date('2024-03-10'),
        location: 'Los Angeles, CA',
        status: 'completed',
        ticketType: 'Courtside',
        price: 450,
        category: 'Sports',
        description: 'Watch the final championship game with courtside seats.',
        imageUrl: 'assets/images/basketball.jpg',
        attendees: 18000,
        organizer: 'Sports Events LLC',
        progress: 100,
        tags: ['Sports', 'Basketball', 'Championship']
      },
      {
        id: 5,
        title: 'Art Exhibition',
        date: new Date('2024-04-15'),
        location: 'New York, NY',
        status: 'upcoming',
        ticketType: 'VIP Access',
        price: 175,
        category: 'Arts',
        description: 'Exclusive exhibition featuring contemporary artists from around the world.',
        imageUrl: 'assets/images/art-exhibition.jpg',
        attendees: 800,
        organizer: 'Modern Art Gallery',
        progress: 30,
        tags: ['Art', 'Exhibition', 'Contemporary']
      }
    ];
  }

  calculateStats() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    this.eventStats = {
      totalEvents: this.bookedEvents.length,
      upcomingEvents: this.bookedEvents.filter(e => e.status === 'upcoming').length,
      completedEvents: this.bookedEvents.filter(e => e.status === 'completed').length,
      cancelledEvents: this.bookedEvents.filter(e => e.status === 'cancelled').length,
      totalSpent: this.bookedEvents.reduce((sum, event) => sum + event.price, 0),
      favoriteCategory: this.getFavoriteCategory(),
      monthlySpending: this.bookedEvents
        .filter(e => e.date >= monthStart)
        .reduce((sum, event) => sum + event.price, 0),
      yearlySpending: this.bookedEvents
        .filter(e => e.date >= yearStart)
        .reduce((sum, event) => sum + event.price, 0),
      averageTicketPrice: this.bookedEvents.reduce((sum, event) => sum + event.price, 0) / this.bookedEvents.length,
      mostExpensiveEvent: this.bookedEvents.reduce((max, event) => 
        event.price > max.price ? event : max, this.bookedEvents[0]),
      upcomingSpending: this.bookedEvents
        .filter(e => e.status === 'upcoming')
        .reduce((sum, event) => sum + event.price, 0)
    };
  }

  calculateCategoryStats() {
    const categoryMap = new Map<string, { count: number; totalSpent: number }>();
    
    this.bookedEvents.forEach(event => {
      const current = categoryMap.get(event.category) || { count: 0, totalSpent: 0 };
      categoryMap.set(event.category, {
        count: current.count + 1,
        totalSpent: current.totalSpent + event.price
      });
    });

    const totalEvents = this.bookedEvents.length;
    const totalSpent = this.eventStats.totalSpent;

    this.categoryStats = Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      count: stats.count,
      totalSpent: stats.totalSpent,
      percentage: (stats.count / totalEvents) * 100
    })).sort((a, b) => b.count - a.count);
  }

  getFavoriteCategory(): string {
    const categoryCount = this.bookedEvents.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None';
  }

  filterEventsByCategory(category: string) {
    this.selectedCategory = category;
    this.currentPage = 1; // Reset to first page when filtering
  }

  getFilteredEvents(): BookedEvent[] {
    let events = this.bookedEvents;
    
    // Apply date filter if a date is selected
    if (this.isDateFiltered && this.selectedDate) {
      events = events.filter(event => 
        moment(event.date).isSame(this.selectedDate, 'day')
      );
    }
    
    // Apply category filter
    if (this.selectedCategory !== 'All') {
      events = events.filter(event => event.category === this.selectedCategory);
    }

    // Sort events
    events = [...events].sort((a, b) => {
      let comparison = 0;
      switch (this.sortBy) {
        case 'date':
          comparison = a.date.getTime() - b.date.getTime();
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'name':
          comparison = a.title.localeCompare(b.title);
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
      currency: 'USD'
    }).format(amount);
  }

  onDateSelected(date: Date | null) {
    this.selectedDate = date;
    this.isDateFiltered = date !== null;
    this.currentPage = 1; // Reset to first page when filtering
  }

  getEventsForDate(date: Date): BookedEvent[] {
    return this.bookedEvents.filter(event => 
      moment(event.date).isSame(date, 'day')
    );
  }

  hasEventsOnDate = (date: Date): string => {
    return this.getEventsForDate(date).length > 0 ? 'has-events' : '';
  }

  cancelEvent(event: BookedEvent) {
    // TODO: Implement actual cancellation logic with API call
    const index = this.bookedEvents.findIndex(e => e.id === event.id);
    if (index !== -1) {
      this.bookedEvents[index].status = 'cancelled';
      this.calculateStats();
      this.calculateCategoryStats();
      this.snackBar.open('Event booking cancelled successfully', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
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
} 