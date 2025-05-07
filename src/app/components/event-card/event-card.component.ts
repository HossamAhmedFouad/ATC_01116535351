import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  imageUrl: string;
  price: number;
  category: string;
  duration: string;
  organizer: string;
  availableTickets: number;
  schedule: {
    day: string;
    events: {
      time: string;
      title: string;
    }[];
  }[];
}

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.css']
})
export class EventCardComponent {
  @Input() event!: Event;

  constructor(private router: Router) {}

  onBookClick() {
    this.router.navigate(['/events', this.event.id]);
  }
} 