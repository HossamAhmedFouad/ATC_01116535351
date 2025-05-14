import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Event, EventService } from '../../services/event.service';
import { ToastService } from '../../services/toast.service';
import { LoaderComponent } from '../../components/loader/loader.component';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css'],
})
export class EventDetailsComponent implements OnInit {
  event: Event | null = null;
  loading = true;
  error = false;
  ticketsToBook = 1;
  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private eventService: EventService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEventDetails(eventId);
    } else {
      this.error = true;
      this.loading = false;
    }
  }
  loadEventDetails(eventId: string) {
    this.eventService.getEvent(eventId).subscribe({
      next: (event) => {
        this.event = event;
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
    if (this.event) {
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
