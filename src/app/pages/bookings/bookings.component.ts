import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatTableModule,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

import { Booking, BookingService } from '../../services/booking.service';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { TicketService, Ticket } from '../../services/ticket.service';

// Rename Event import to avoid conflict with DOM Event
import { Event as EventModel } from '../../services/event.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.css',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class BookingsComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'event',
    'booking_time',
    'tickets',
    'total_price',
    'status',
    'actions',
  ];
  expandedElement: Booking | null = null;
  bookings: Booking[] = [];
  filteredBookings = new MatTableDataSource<Booking>();
  isLoading = true;
  searchQuery = '';
  selectedStatusFilter: 'all' | 'booked' | 'cancelled' | 'completed' = 'all';
  events: Map<number, EventModel> = new Map();

  // Properties for booking counts
  get bookedCount(): number {
    return this.bookings.filter((booking) => booking.status === 'booked')
      .length;
  }

  get cancelledCount(): number {
    return this.bookings.filter((booking) => booking.status === 'cancelled')
      .length;
  }

  get completedCount(): number {
    return this.bookings.filter((booking) => booking.status === 'completed')
      .length;
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Booking>;

  constructor(
    private bookingService: BookingService,
    private eventService: EventService,
    private ticketService: TicketService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUserBookings();
  }

  loadUserBookings(): void {
    // Get the current user ID (in a real app, this would come from authentication)
    const userId = 1; // Mock user ID

    this.isLoading = true;

    // Get all events first to be able to display event details
    this.eventService.getEvents().subscribe(
      (events) => {
        // Store events in map for quick lookup
        events.forEach((event) => {
          this.events.set(event.id, event);
        });

        // Now get bookings
        this.bookingService.getUserBookings(userId).subscribe(
          (bookings) => {
            this.bookings = bookings;
            this.filteredBookings.data = [...this.bookings];
            this.isLoading = false;

            // Set up table after data is loaded
            setTimeout(() => {
              if (this.table) {
                this.filteredBookings.paginator = this.paginator;
                this.filteredBookings.sort = this.sort;
                this.table.dataSource = this.filteredBookings;
              }
            });
          },
          (error) => {
            console.error('Error fetching user bookings:', error);
            this.isLoading = false;
            this.showNotification(
              'Error loading bookings. Please try again later.',
              'error'
            );
          }
        );
      },
      (error) => {
        console.error('Error fetching events:', error);
        this.isLoading = false;
        this.showNotification(
          'Error loading events. Please try again later.',
          'error'
        );
      }
    );
  }
  applyFilter(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchQuery = inputElement.value.trim().toLowerCase();
    this.filterBookings();
  }

  filterByStatus(status: 'all' | 'booked' | 'cancelled' | 'completed'): void {
    this.selectedStatusFilter = status;
    this.filterBookings();
  }

  filterBookings(): void {
    // First filter by search query
    let filtered = this.bookings.filter((booking) => {
      const event = this.events.get(booking.event_id);
      return (
        booking.id.toString().includes(this.searchQuery) ||
        (event && event.title.toLowerCase().includes(this.searchQuery)) ||
        (event && event.location.toLowerCase().includes(this.searchQuery)) ||
        booking.status.toLowerCase().includes(this.searchQuery)
      );
    });

    // Then filter by status if not 'all'
    if (this.selectedStatusFilter !== 'all') {
      filtered = filtered.filter(
        (booking) => booking.status === this.selectedStatusFilter
      );
    }

    this.filteredBookings.data = filtered;

    // Reset paginator to first page
    if (this.paginator) {
      this.paginator.firstPage();
    }

    // Update table data source
    if (this.table) {
      this.table.dataSource = this.filteredBookings;
    }
  }
  getEventDetails(eventId: number): EventModel | undefined {
    return this.events.get(eventId);
  }

  viewEventDetails(eventId: number): void {
    this.router.navigate(['/events', eventId]);
  }

  downloadTicket(ticket: Ticket): void {
    // In a real app, this would generate and download a PDF ticket
    alert(`Downloading ticket: ${ticket.ticket_code}`);
  }

  cancelBooking(booking: Booking): void {
    // Ask for confirmation before cancelling
    if (
      !confirm(
        'Are you sure you want to cancel this booking? All tickets will be cancelled.'
      )
    ) {
      return;
    }

    this.isLoading = true;
    this.bookingService.cancelBooking(booking.id).subscribe(
      (response) => {
        // Update the status locally
        const index = this.bookings.findIndex((b) => b.id === booking.id);
        if (index !== -1) {
          this.bookings[index].status = 'cancelled';
          // Also update all tickets
          if (this.bookings[index].ticketList) {
            this.bookings[index].ticketList.forEach((ticket) => {
              ticket.status = 'cancelled';
            });
          }
        }

        // Update the filtered list
        this.filterBookings();
        this.isLoading = false;
        this.showNotification('Booking cancelled successfully', 'success');
      },
      (error) => {
        console.error('Error cancelling booking:', error);
        this.isLoading = false;
        this.showNotification(
          'Error cancelling booking. Please try again later.',
          'error'
        );
      }
    );
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'booked':
        return 'booked';
      case 'cancelled':
        return 'cancelled';
      case 'completed':
        return 'completed';
      default:
        return '';
    }
  }

  getFormattedDate(date: Date | string): string {
    return new Date(date).toLocaleString();
  }

  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass:
        type === 'error'
          ? ['error-snackbar']
          : type === 'success'
          ? ['success-snackbar']
          : ['info-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
