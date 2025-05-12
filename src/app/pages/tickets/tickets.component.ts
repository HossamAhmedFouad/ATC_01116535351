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
import { TicketService, Ticket } from '../../services/ticket.service';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

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
  ],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.css',
})
export class TicketsComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'booking_id',
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
  selectedStatusFilter: 'all' | 'confirmed' | 'cancelled' = 'all';

  // Properties for ticket counts
  get confirmedTicketsCount(): number {
    return this.tickets.filter((ticket) => ticket.status === 'confirmed')
      .length;
  }

  get cancelledTicketsCount(): number {
    return this.tickets.filter((ticket) => ticket.status === 'cancelled')
      .length;
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Ticket>;

  constructor(
    private ticketService: TicketService,
    private bookingService: BookingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserTickets();
  }

  loadUserTickets(): void {
    // Get the current user ID (in a real app, this would come from authentication)
    const userId = 1; // Mock user ID

    this.isLoading = true;

    // Get all bookings for the user
    this.bookingService.getUserBookings(userId).subscribe(
      (bookings) => {
        // Create an array to hold all promises for ticket fetching
        const ticketRequests: Promise<Ticket[]>[] = [];

        // For each booking, get the related tickets
        bookings.forEach((booking) => {
          const promise = new Promise<Ticket[]>((resolve) => {
            this.ticketService.getTicketsForBooking(booking.id).subscribe(
              (tickets) => resolve(tickets),
              (error) => {
                console.error(
                  `Error fetching tickets for booking ${booking.id}:`,
                  error
                );
                resolve([]);
              }
            );
          });
          ticketRequests.push(promise);
        });

        // Wait for all ticket requests to complete
        Promise.all(ticketRequests).then((ticketArrays) => {
          // Flatten the array of ticket arrays into a single array
          this.tickets = ticketArrays.flat();
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
        });
      },
      (error) => {
        console.error('Error fetching user bookings:', error);
        this.isLoading = false;
      }
    );
  }

  applyFilter(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.filterTickets();
  }

  filterByStatus(status: 'all' | 'confirmed' | 'cancelled'): void {
    this.selectedStatusFilter = status;
    this.filterTickets();
  }

  filterTickets(): void {
    // First filter by search query
    let filtered = this.tickets.filter(
      (ticket) =>
        ticket.ticket_code.toLowerCase().includes(this.searchQuery) ||
        ticket.booking_id.toString().includes(this.searchQuery) ||
        ticket.id.toString().includes(this.searchQuery)
    );

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
    return status === 'confirmed' ? 'primary' : 'warn';
  }

  viewBookingDetails(bookingId: number): void {
    this.router.navigate(['/bookings', bookingId]);
  }

  downloadTicket(ticket: Ticket): void {
    // In a real app, this would generate and download a PDF ticket
    alert(`Downloading ticket: ${ticket.ticket_code}`);
  }
}
