import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { Event, EventService } from '../../services/event.service';
import { ToastService } from '../../services/toast.service';
import { LoaderComponent } from '../../components/loader/loader.component';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { filter, Subscription } from 'rxjs';

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
  private navigationSubscription: Subscription | null = null;
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
    this.eventId = this.route.snapshot.paramMap.get('id');
    if (this.eventId) {
      this.loadEventDetails(this.eventId);

      // Set up navigation subscription to detect returning from payment page
      this.navigationSubscription = this.router.events
        .pipe(filter((event) => event instanceof NavigationStart))
        .subscribe((event: any) => {
          // Check if we're coming back to this page from the payment page
          if (
            event.url.includes('/events') &&
            event.navigationTrigger === 'popstate'
          ) {
            console.log('Returning to event details, refreshing data...');
            if (this.eventId) {
              // Clear event cache and reload event details
              this.eventService.clearEventCache(this.eventId);
              this.loadEventDetails(this.eventId);
            }
          }
        });
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }
  loadEventDetails(eventId: string, forceRefresh: boolean = false) {
    this.loading = true;

    // If force refresh is requested, clear the event cache first
    if (forceRefresh) {
      this.eventService.clearEventCache(eventId);
    }

    this.eventService.getEvent(eventId).subscribe({
      next: (event) => {
        this.event = event;
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
