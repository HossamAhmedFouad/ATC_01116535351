import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar } from '@angular/material/snack-bar';

interface BookedEvent {
  id: number;
  title: string;
  date: Date;
  location: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  ticketType: string;
  price: number;
}

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
    MatBadgeModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  currentDate: Date = new Date();
  selectedView: 'day' | 'week' | 'month' = 'month';
  bookedEvents: BookedEvent[] = [];
  calendarEvents: BookedEvent[] = [];
  selectedDate: Date | null = null;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadUserEvents();
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
        price: 299
      },
      {
        id: 2,
        title: 'Music Festival',
        date: new Date('2024-04-20'),
        location: 'Austin, TX',
        status: 'upcoming',
        ticketType: 'General Admission',
        price: 199
      },
      {
        id: 3,
        title: 'Food & Wine Expo',
        date: new Date('2024-05-05'),
        location: 'Chicago, IL',
        status: 'upcoming',
        ticketType: 'Premium Pass',
        price: 149
      }
    ];
    this.updateCalendarEvents();
  }

  updateCalendarEvents() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    switch (this.selectedView) {
      case 'day':
        this.calendarEvents = this.bookedEvents.filter(event => 
          event.date >= startOfDay && event.date < endOfDay
        );
        break;
      case 'week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        this.calendarEvents = this.bookedEvents.filter(event => 
          event.date >= startOfWeek && event.date < endOfWeek
        );
        break;
      case 'month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        this.calendarEvents = this.bookedEvents.filter(event => 
          event.date >= startOfMonth && event.date <= endOfMonth
        );
        break;
    }
  }

  changeView(view: 'day' | 'week' | 'month') {
    this.selectedView = view;
    this.updateCalendarEvents();
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
        return 'check_circle';
      case 'cancelled':
        return 'cancel';
      default:
        return 'help';
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onDateSelected(date: Date | null) {
    this.selectedDate = date;
    if (date) {
      this.updateCalendarEvents();
    }
  }

  getEventsForDate(date: Date): BookedEvent[] {
    return this.bookedEvents.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
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
      this.updateCalendarEvents();
      this.snackBar.open('Event booking cancelled successfully', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }
  }
} 