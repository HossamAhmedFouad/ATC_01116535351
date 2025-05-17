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

import { Booking, Ticket } from '../../services/booking.service';
import { BookingService } from '../../services/booking.service';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { LoaderComponent } from '../../components/loader/loader.component';
import { CancelBookingDialogComponent } from '../../components/cancel-booking-dialog/cancel-booking-dialog.component';

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
    LoaderComponent,
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
  selectedStatusFilter: 'all' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' = 'all';
  events: Map<string, EventModel> = new Map();
  // Properties for booking counts
  get bookedCount(): number {
    return this.bookings.filter((booking) => booking.status === 'CONFIRMED')
      .length;
  }

  get cancelledCount(): number {
    return this.bookings.filter((booking) => booking.status === 'CANCELLED')
      .length;
  }
  get completedCount(): number {
    return this.bookings.filter((booking) => {
      // Skip cancelled bookings
      if (booking.status === 'CANCELLED') {
        return false;
      }
      // Get event details
      const event = this.events.get(booking.event_id);
      if (!event) {
        return false;
      }
      // Check if event date has passed
      const eventDate = new Date(event.date);
      const today = new Date();
      return eventDate < today;
    }).length;
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Booking>;
  constructor(
    private bookingService: BookingService,
    private eventService: EventService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadUserBookings();
  }
  loadUserBookings(): void {
    this.isLoading = true;

    // Get all events first to be able to display event details
    this.eventService.getEvents().subscribe(
      (events) => {
        // Store events in map for quick lookup
        events.forEach((event) => {
          this.events.set(event.id, event);
        });

        // Now get bookings
        this.bookingService.getUserBookings().subscribe(
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
            this.toastService.error(
              'Error loading bookings. Please try again later.'
            );
          }
        );
      },
      (error) => {
        console.error('Error fetching events:', error);
        this.isLoading = false;
        this.toastService.error(
          'Error loading events. Please try again later.'
        );
      }
    );
  }
  applyFilter(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchQuery = inputElement.value.trim().toLowerCase();
    this.filterBookings();
  }
  filterByStatus(
    status: 'all' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  ): void {
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
        (event && event.location?.toLowerCase().includes(this.searchQuery)) ||
        booking.status.toLowerCase().includes(this.searchQuery)
      );
    }); // Then filter by status if not 'all'
    if (this.selectedStatusFilter !== 'all') {
      filtered = filtered.filter((booking) => {
        if (this.selectedStatusFilter === 'COMPLETED') {
          // For completed status, check event date
          if (booking.status === 'CANCELLED') {
            return false;
          }
          const event = this.events.get(booking.event_id);
          if (!event) {
            return false;
          }
          const eventDate = new Date(event.date);
          const today = new Date();
          return eventDate < today;
        } else {
          // For other statuses, just check the booking status
          return booking.status === this.selectedStatusFilter;
        }
      });
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

  getEventDetails(eventId: string): EventModel | undefined {
    return this.events.get(eventId);
  }
  viewEventDetails(eventId: string): void {
    this.router.navigate(['/events', eventId]);
  }
  downloadTicket(ticket: Ticket): void {
    // In a real app, this would generate and download a PDF ticket
    alert(`Downloading ticket: ${ticket.ticket_code}`);
  }

  cancelBooking(booking: Booking): void {
    const eventDetails = this.getEventDetails(booking.event_id);
    const dialogRef = this.dialog.open(CancelBookingDialogComponent, {
      width: '500px',
      panelClass: 'cancel-booking-dialog',
      data: {
        bookingId: booking.id,
        eventTitle: eventDetails?.title || 'Unknown Event',
        ticketsCount: booking.tickets_count || 0,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLoading = true;
        this.bookingService.cancelBooking(booking.id).subscribe(
          (updatedBooking) => {
            // Update the status locally
            const index = this.bookings.findIndex((b) => b.id === booking.id);
            if (index !== -1) {
              this.bookings[index] = updatedBooking;
            }

            // Update the filtered list
            this.filterBookings();
            this.isLoading = false;
            this.toastService.success('Booking cancelled successfully');
          },
          (error) => {
            console.error('Error cancelling booking:', error);
            this.isLoading = false;
            this.toastService.error(
              'Error cancelling booking. Please try again later.'
            );
          }
        );
      }
    });
  }
  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'confirmed';
      case 'BOOKED':
        return 'booked';
      case 'CANCELLED':
        return 'cancelled';
      case 'COMPLETED':
        return 'completed';
      case 'PENDING':
        return 'pending';
      case 'REFUNDED':
        return 'refunded';
      case 'VALID':
        return 'valid';
      default:
        return '';
    }
  }
  getStatusIcon(status: string): string {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'event_available';
      case 'BOOKED':
        return 'event_seat';
      case 'CANCELLED':
        return 'event_busy';
      case 'COMPLETED':
        return 'event_note';
      case 'PENDING':
        return 'pending';
      case 'REFUNDED':
        return 'currency_exchange';
      case 'EXPIRED':
        return 'schedule';
      case 'VALID':
        return 'verified';
      default:
        return 'help_outline';
    }
  }

  getFormattedDate(date: Date | string): string {
    return new Date(date).toLocaleString();
  }

  // This method is now redundant since we're using the ToastService directly
  // We'll keep it for compatibility with existing code but update it to use ToastService
  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    if (type === 'error') {
      this.toastService.error(message);
    } else if (type === 'success') {
      this.toastService.success(message);
    } else {
      this.toastService.info(message);
    }
  }
}
