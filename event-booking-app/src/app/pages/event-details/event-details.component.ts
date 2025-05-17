import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Event, EventService } from '../../services/event.service';
import { ToastService } from '../../services/toast.service';
import { LoaderComponent } from '../../components/loader/loader.component';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css'],
})
export class EventDetailsComponent implements OnInit, OnDestroy {
  event: Event | null = null;
  loading = true;
  error = false;
  ticketsToBook = 1;
  isEventBooked = false;
  private routeSubscription: Subscription | null = null;
  private eventId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private eventService: EventService,
    private toastService: ToastService,
    private authService: AuthService,
    private bookingService: BookingService
  ) {}

  ngOnInit() {
    // Subscribe to route params to handle navigation within the same component
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      this.eventId = params.get('id');
      if (this.eventId) {
        this.loadEventDetails(this.eventId);
      } else {
        this.error = true;
        this.loading = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
  loadEventDetails(eventId: string) {
    this.loading = true;

    this.eventService.getEvent(eventId).subscribe({
      next: (event) => {
        this.event = event;
        // Update isCompleted flag based on current date
        this.event.isCompleted = new Date(event.date) < new Date();
        this.checkIfEventIsBooked(eventId);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading event details:', error);
        this.toastService.error('Failed to load event details');
        this.error = true;
        this.loading = false;
      },
    });
  }

  checkIfEventIsBooked(eventId: string) {
    // Only check if user is logged in
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.bookingService.getUserBookings().subscribe({
          next: (bookings) => {
            // Check if the user has a non-cancelled booking for this event
            this.isEventBooked = bookings.some(
              (booking) =>
                booking.event_id === eventId && booking.status !== 'CANCELLED'
            );

            if (this.event) {
              this.event.isBooked = this.isEventBooked;
            }
          },
          error: (error) => console.error('Error checking bookings:', error),
        });
      }
    });
  }

  incrementTickets() {
    if (
      this.event &&
      this.ticketsToBook < (this.event.available_tickets || 0)
    ) {
      this.ticketsToBook++;
    }
  }

  decrementTickets() {
    if (this.ticketsToBook > 1) {
      this.ticketsToBook--;
    }
  }

  get totalPrice(): number {
    return this.event ? (this.event.price || 0) * this.ticketsToBook : 0;
  }
  onBookNow() {
    // Don't proceed with booking if event is already booked
    if (this.isEventBooked) {
      this.toastService.info('You have already booked this event');
      return;
    }

    if (this.event) {
      // Store the available tickets count before navigating
      const currentAvailableTickets = this.event.available_tickets;

      this.router.navigate(['/payment'], {
        queryParams: {
          eventId: this.event.id,
          ticketCount: this.ticketsToBook,
          totalAmount: this.totalPrice,
          eventTitle: this.event.title,
        },
      });
    }
  }

  navigateToEvents() {
    this.router.navigate(['/events']);
  }
}
