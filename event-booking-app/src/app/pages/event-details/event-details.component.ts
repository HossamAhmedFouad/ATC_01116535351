import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Event } from '../../services/event.service';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule],
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
    private http: HttpClient
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
    this.http.get<{ events: Event[] }>('./assets/data/events.json').subscribe({
      next: (data) => {
        this.event = data.events.find((e) => e.id === eventId) || null;
        this.loading = false;
        if (!this.event) {
          this.error = true;
        }
      },
      error: (error) => {
        console.error('Error loading event details:', error);
        this.error = true;
        this.loading = false;
      },
    });
  }

  incrementTickets() {
    if (this.event && this.ticketsToBook < this.event.available_tickets!) {
      this.ticketsToBook++;
    }
  }

  decrementTickets() {
    if (this.ticketsToBook > 1) {
      this.ticketsToBook--;
    }
  }

  get totalPrice(): number {
    return this.event ? this.event.price! * this.ticketsToBook : 0;
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
