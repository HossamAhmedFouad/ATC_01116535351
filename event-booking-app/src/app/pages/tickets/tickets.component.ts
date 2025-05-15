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
import { TicketService } from '../../services/ticket.service';
import {
  BookingService,
  Ticket,
  Booking,
} from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { LoaderComponent } from '../../components/loader/loader.component';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [
    CommonModule,
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
    LoaderComponent,
  ],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.css',
})
export class TicketsComponent implements OnInit {
  displayedColumns: string[] = [
    'event',
    'ticket_code',
    'price',
    'issued_date',
    'status',
    'actions',
  ];
  tickets: Ticket[] = [];
  filteredTickets = new MatTableDataSource<Ticket>();
  isLoading = true;
  searchQuery = '';
  selectedStatusFilter: 'all' | 'CONFIRMED' | 'CANCELLED' = 'all';
  bookingsMap: Map<string, Booking> = new Map();
  eventsMap: Map<string, any> = new Map();

  // Properties for ticket counts
  get confirmedTicketsCount(): number {
    return this.tickets.filter((ticket) => ticket.status === 'CONFIRMED')
      .length;
  }

  get cancelledTicketsCount(): number {
    return this.tickets.filter((ticket) => ticket.status === 'CANCELLED')
      .length;
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Ticket>;
  constructor(
    private ticketService: TicketService,
    private bookingService: BookingService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.loadUserTickets();
  }
  loadUserTickets(): void {
    this.isLoading = true;

    // Get all bookings for the user
    this.bookingService.getUserBookings().subscribe(
      (bookings) => {
        // Extract all tickets from bookings
        this.tickets = [];
        bookings.forEach((booking) => {
          // Store the booking in our map
          this.bookingsMap.set(booking.id, booking);

          // Load the event details for this booking
          this.eventService.getEvent(booking.event_id).subscribe(
            (event) => {
              this.eventsMap.set(booking.event_id, event);
            },
            (error) => {
              console.error('Error loading event details:', error);
            }
          );

          if (booking.ticket_items && booking.ticket_items.length > 0) {
            this.tickets.push(...booking.ticket_items);
          }
        });

        this.filteredTickets.data = [...this.tickets];
        this.isLoading = false;

        // Set up table after data is loaded
        setTimeout(() => {
          if (this.table) {
            this.filteredTickets.paginator = this.paginator;
            this.filteredTickets.sort = this.sort;
            this.table.dataSource = this.filteredTickets;
          }
        });
      },
      (error) => {
        console.error('Error fetching user bookings:', error);
        this.isLoading = false;
        this.toastService.error('Failed to load your tickets');
      }
    );
  }

  applyFilter(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.filterTickets();
  }

  filterByStatus(status: 'all' | 'CONFIRMED' | 'CANCELLED'): void {
    this.selectedStatusFilter = status;
    this.filterTickets();
  }
  filterTickets(): void {
    // First filter by search query
    let filtered = this.tickets.filter((ticket) => {
      // Get the event for this ticket
      const event = this.getEventForBooking(ticket.booking_id);
      const eventTitle = event?.title?.toLowerCase() || '';

      return (
        ticket.ticket_code.toLowerCase().includes(this.searchQuery) ||
        ticket.booking_id.toString().includes(this.searchQuery) ||
        ticket.id.toString().includes(this.searchQuery) ||
        eventTitle.includes(this.searchQuery)
      );
    });

    // Then filter by status if not 'all'
    if (this.selectedStatusFilter !== 'all') {
      filtered = filtered.filter(
        (ticket) => ticket.status === this.selectedStatusFilter
      );
    }

    this.filteredTickets.data = filtered;

    // Reset paginator and sort
    if (this.paginator) {
      this.paginator.firstPage();
    }

    // Update table data source
    if (this.table) {
      this.table.dataSource = this.filteredTickets;
    }
  }

  getStatusColor(status: string): string {
    return status === 'CONFIRMED' ? 'primary' : 'warn';
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

  viewBookingDetails(bookingId: string): void {
    this.router.navigate(['/bookings', bookingId]);
  }

  downloadTicket(ticket: Ticket): void {
    // In a real app, this would generate and download a PDF ticket
    alert(`Downloading ticket: ${ticket.ticket_code}`);
  }

  // Method to get the event name for a booking ID
  getEventForBooking(bookingId: string): any {
    const booking = this.bookingsMap.get(bookingId);
    if (!booking) return null;

    return this.eventsMap.get(booking.event_id) || { title: 'Loading...' };
  }
}
