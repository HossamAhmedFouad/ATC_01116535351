import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventCardComponent } from '../../components/event-card/event-card.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { HttpClient } from '@angular/common/http';
import { Event } from '../../services/event.service';
import { EventService } from '../../services/event.service';
import { LoaderComponent } from '../../components/loader/loader.component';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EventCardComponent,
    SearchBarComponent,
    LoaderComponent,
  ],
  templateUrl: './events.component.html',
  styleUrls: ['events.component.css'],
})
export class EventsComponent implements OnInit {
  searchQuery = '';
  priceFilter = '';
  locationFilter = '';
  dateFilter = '';
  categoryFilter = '';

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;

  locations: string[] = [];
  categories: string[] = [];

  events: Event[] = [];
  loading = false;

  constructor(private http: HttpClient, private eventService: EventService) {}

  ngOnInit() {
    this.loadEvents();
    this.loadMetadata();
  }

  loadEvents() {
    this.loading = true;
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.totalPages = Math.ceil(this.events.length / this.itemsPerPage);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.loading = false;
      },
    });
  }

  loadMetadata() {
    this.eventService.getEventMetadata().subscribe({
      next: (metadata) => {
        this.locations = metadata.locations;
        this.categories = metadata.categories;
      },
      error: (error) => console.error('Error loading metadata:', error),
    });
  }

  get filteredEvents() {
    console.log('Filtering events...');
    const filtered = this.events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        event.description
          ?.toLowerCase()
          .includes(this.searchQuery.toLowerCase());
      const matchesPrice =
        !this.priceFilter ||
        this.matchPriceRange(event.price || 0, this.priceFilter);
      const matchesLocation =
        !this.locationFilter ||
        event.location
          ?.toLowerCase()
          .includes(this.locationFilter.toLowerCase());
      const matchesDate =
        !this.dateFilter || this.matchDateFilter(event.date, this.dateFilter);
      const matchesCategory =
        !this.categoryFilter || event.category === this.categoryFilter;

      return (
        matchesSearch &&
        matchesPrice &&
        matchesLocation &&
        matchesDate &&
        matchesCategory
      );
    });
    console.log('Filtered events count:', filtered.length);
    return filtered;
  }

  get paginatedEvents() {
    const filtered = this.filteredEvents;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get pageNumbers() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  private matchPriceRange(price: number, range: string): boolean {
    switch (range) {
      case 'free':
        return price === 0;
      case 'under50':
        return price < 50;
      case 'under100':
        return price < 100;
      case 'under200':
        return price < 200;
      case 'over200':
        return price >= 200;
      default:
        return true;
    }
  }

  private matchDateFilter(eventDate: string | Date, filter: string): boolean {
    const today = new Date();
    const eventDateTime = new Date(eventDate);

    switch (filter) {
      case 'today':
        return eventDateTime.toDateString() === today.toDateString();
      case 'thisWeek':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return eventDateTime >= weekAgo && eventDateTime <= today;
      case 'thisMonth':
        return (
          eventDateTime.getMonth() === today.getMonth() &&
          eventDateTime.getFullYear() === today.getFullYear()
        );
      case 'nextMonth':
        const nextMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          1
        );
        const nextMonthEnd = new Date(
          today.getFullYear(),
          today.getMonth() + 2,
          0
        );
        return eventDateTime >= nextMonth && eventDateTime <= nextMonthEnd;
      default:
        return true;
    }
  }

  resetFilters() {
    this.searchQuery = '';
    this.priceFilter = '';
    this.locationFilter = '';
    this.dateFilter = '';
    this.categoryFilter = '';
    this.currentPage = 1;
  }
}
