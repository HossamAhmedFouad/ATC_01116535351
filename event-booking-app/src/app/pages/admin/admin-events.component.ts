import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { EventService } from '../../services/event.service';
import { AdminService } from '../../services/admin.service';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { LoaderComponent } from '../../components/loader/loader.component';

interface Event {
  id: string; // UUID format from backend
  title: string;
  date: Date;
  time?: string; // UI-only field for time input
  location?: string;
  description?: string;
  image_url?: string;
  price?: number;
  category?: string;
  duration?: string;
  organizer?: string;
  available_tickets?: number;
  schedule?: any;
  // UI-specific fields
  status?: 'active' | 'inactive';
  bookingsCount?: number;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Component({
  selector: 'app-admin-events',
  templateUrl: './admin-events.component.html',
  styleUrls: ['./admin-events.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    SearchBarComponent,
    LoaderComponent,
  ],
})
export class AdminEventsComponent implements OnInit {
  // Events data
  events: Event[] = [];
  filteredEvents: Event[] = [];

  // Pagination
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;

  // Filters
  searchTerm: string = '';
  filterStatus: string = 'all';
  startDate?: Date;
  endDate?: Date;

  // Date range preset
  dateRangePreset: string = 'all';

  // Sorting
  sortColumn: string = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Modals
  showEventModal: boolean = false;
  showDeleteModal: boolean = false;
  isEditMode: boolean = false;
  eventToDelete?: Event;

  // Form
  eventForm!: FormGroup;

  // Toasts
  toasts: Toast[] = [];
  nextToastId: number = 1;
  // Bulk actions
  selectedEvents: Event[] = [];
  bulkAction: string = '';

  // Loading state
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private adminService: AdminService
  ) {}
  ngOnInit(): void {
    this.initEventForm();
    this.loadEvents();
    this.filterEvents();
  }

  // Initialize event form
  initEventForm(): void {
    this.eventForm = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      date: ['', Validators.required],
      time: [''],
      location: [''],
      description: [''],
      status: ['active'],
      available_tickets: [100, [Validators.required, Validators.min(0)]],
      image_url: [''],
      price: [0, [Validators.min(0)]],
      category: ['General'],
      duration: ['2 hours'],
      organizer: ['Event System'],
      schedule: ['{}'],
    });
  }

  // Load events from API
  loadEvents(): void {
    this.isLoading = true;

    // Build params for API request
    const params: any = {
      sortBy: this.sortColumn,
      sortDirection: this.sortDirection,
    };

    if (this.filterStatus !== 'all') {
      params.status = this.filterStatus;
    }

    if (this.startDate) {
      params.startDate = new Date(this.startDate).toISOString().split('T')[0];
    }

    if (this.endDate) {
      params.endDate = new Date(this.endDate).toISOString().split('T')[0];
    }

    if (this.searchTerm) {
      params.searchTerm = this.searchTerm;
    }

    this.adminService.getAllEvents(params).subscribe({
      next: (response) => {
        this.events = response.data.events.map((event: any) => ({
          ...event,
          date: new Date(event.date),
        }));
        this.filterEvents();
        this.isLoading = false;
      },
      error: (err) => {
        this.showToast(
          'Error loading events: ' + (err.message || 'Unknown error'),
          'error'
        );
        this.isLoading = false;
      },
    });
  }

  // Filter events based on search and filters
  filterEvents(): void {
    let filtered = [...this.events];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(term) ||
          event.location?.toLowerCase()?.includes(term) ||
          false ||
          event.description?.toLowerCase()?.includes(term) ||
          false
      );
    }

    // Status filter
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter((event) => event.status === this.filterStatus);
    }

    // Date range filter
    if (this.startDate) {
      const startDate = new Date(this.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((event) => new Date(event.date) >= startDate);
    }

    if (this.endDate) {
      const endDate = new Date(this.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((event) => new Date(event.date) <= endDate);
    }

    // Apply sorting
    this.sortEvents(filtered);

    // Calculate pagination
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    this.filteredEvents = filtered.slice(startIndex, endIndex);
  }

  // Sort events
  sortBy(column: string): void {
    if (this.sortColumn === column) {
      // Toggle direction if clicking the same column
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filterEvents();
  }

  // Get sort icon class
  getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return 'fas fa-sort';
    }
    return this.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  }

  // Apply sorting to events array
  private sortEvents(events: Event[]): void {
    events.sort((a: any, b: any) => {
      const aValue = a[this.sortColumn];
      const bValue = b[this.sortColumn];

      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.filterEvents();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const totalVisible = 5;

    if (this.totalPages <= totalVisible) {
      // Show all pages if there are fewer than totalVisible
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show a window of pages around current page
      let startPage = Math.max(
        1,
        this.currentPage - Math.floor(totalVisible / 2)
      );
      let endPage = startPage + totalVisible - 1;

      if (endPage > this.totalPages) {
        endPage = this.totalPages;
        startPage = Math.max(1, endPage - totalVisible + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  // Modal methods
  openEventModal(): void {
    this.isEditMode = false;
    this.eventForm.reset({
      status: 'active',
      date: new Date().toISOString().split('T')[0],
    });
    this.showEventModal = true;
  }

  closeEventModal(): void {
    this.showEventModal = false;
  }

  viewEvent(event: Event): void {
    this.eventService.viewEvent(event.id);
  }

  editEvent(event: Event): void {
    this.isEditMode = true;

    // Extract time from date if available
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toISOString().split('T')[0];

    // Format the event time (if any)
    let eventTime = '';
    if (eventDate) {
      const hours = eventDate.getHours().toString().padStart(2, '0');
      const minutes = eventDate.getMinutes().toString().padStart(2, '0');
      eventTime = `${hours}:${minutes}`;
    }

    // Map status to UI representation
    const status = event.available_tickets === 0 ? 'inactive' : 'active';

    // Prepare the form data
    const formData = {
      ...event,
      date: formattedDate,
      time: eventTime,
      status: status,
      // Map required fields with proper defaults if undefined
      price: event.price || 0,
      category: event.category || 'General',
      duration: event.duration || '2 hours',
      organizer: event.organizer || 'Event System',
      schedule: event.schedule ? JSON.stringify(event.schedule) : '{}',
    };

    this.eventForm.patchValue(formData);
    this.showEventModal = true;
  }
  saveEvent(): void {
    if (this.eventForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.eventForm.controls).forEach((key) => {
        const control = this.eventForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const formData = { ...this.eventForm.value };

    // Convert the schedule JSON string to an actual object if it exists
    if (formData.schedule && typeof formData.schedule === 'string') {
      try {
        formData.schedule = JSON.parse(formData.schedule);
      } catch (e) {
        // If invalid JSON, set to empty object
        formData.schedule = {};
      }
    }

    // Combine date and time if time is provided
    if (formData.time) {
      const dateStr = formData.date;
      formData.date = `${dateStr}T${formData.time}:00`;
    }

    // Remove the time field since it's not in the database schema
    delete formData.time;

    // Map status field to available_tickets if inactive
    if (formData.status === 'inactive') {
      formData.available_tickets = 0;
    }

    // Remove the status field since it's not in the database schema
    delete formData.status;

    this.isLoading = true;

    if (this.isEditMode) {
      // Update existing event
      this.adminService.updateEvent(formData.id, formData).subscribe({
        next: (response) => {
          this.showToast('Event updated successfully', 'success');
          this.closeEventModal();
          this.loadEvents();
        },
        error: (err) => {
          this.showToast(
            'Error updating event: ' + (err.message || 'Unknown error'),
            'error'
          );
          this.isLoading = false;
        },
      });
    } else {
      // Create new event
      this.adminService.createEvent(formData).subscribe({
        next: (response) => {
          this.showToast('Event created successfully', 'success');
          this.closeEventModal();

          // Force a complete refresh of events from the API
          setTimeout(() => {
            this.loadEvents();
          }, 500); // Small delay to ensure backend has processed the creation
        },
        error: (err) => {
          this.showToast(
            'Error creating event: ' + (err.message || 'Unknown error'),
            'error'
          );
          this.isLoading = false;
        },
      });
    }
  }

  confirmDelete(event: Event): void {
    this.eventToDelete = event;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.eventToDelete = undefined;
    this.showDeleteModal = false;
  }
  deleteEvent(): void {
    if (this.eventToDelete) {
      this.isLoading = true;
      this.adminService.deleteEvent(this.eventToDelete.id).subscribe({
        next: () => {
          this.showToast(
            `Event "${this.eventToDelete!.title}" has been deleted`,
            'info'
          );
          this.cancelDelete();
          this.loadEvents();
        },
        error: (err) => {
          this.showToast(
            'Error deleting event: ' + (err.message || 'Unknown error'),
            'error'
          );
          this.isLoading = false;
        },
      });
    }
  }

  // Toast notifications
  showToast(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning'
  ): void {
    const id = this.nextToastId++;
    const toast: Toast = { id, message, type };
    this.toasts.push(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
      this.removeToast(toast);
    }, 5000);
  }

  removeToast(toast: Toast): void {
    this.toasts = this.toasts.filter((t) => t.id !== toast.id);
  }
  getToastIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'fas fa-info-circle';
    }
  }

  // Update searchTerm when search changes
  onSearchChange(newValue: string) {
    this.searchTerm = newValue;
    this.filterEvents();
  }
  // Count events by status
  getEventCountByStatus(status: 'active' | 'inactive'): number {
    return this.events.filter((event) => event.status === status).length;
  }
  // Export events to CSV
  exportEvents(): void {
    if (this.filteredEvents.length === 0) {
      this.showToast('No events to export', 'warning');
      return;
    }

    this.isLoading = true;

    // Build params for export
    const params: any = {};

    if (this.filterStatus !== 'all') {
      params.status = this.filterStatus;
    }

    if (this.startDate) {
      params.startDate = new Date(this.startDate).toISOString().split('T')[0];
    }

    if (this.endDate) {
      params.endDate = new Date(this.endDate).toISOString().split('T')[0];
    }

    if (this.searchTerm) {
      params.searchTerm = this.searchTerm;
    }

    this.adminService.exportEventsToCSV(params).subscribe({
      next: (blob: Blob) => {
        // Create a URL for the blob
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.setAttribute('href', url);
        link.setAttribute(
          'download',
          `events-export-${new Date().toISOString().split('T')[0]}.csv`
        );
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showToast('Events exported successfully', 'success');
        this.isLoading = false;
      },
      error: (err) => {
        this.showToast(
          'Error exporting events: ' + (err.message || 'Unknown error'),
          'error'
        );
        this.isLoading = false;

        // Fallback to client-side export if server fails
        this.clientSideExport();
      },
    });
  }

  // Fallback client-side CSV export
  clientSideExport(): void {
    // CSV header
    const header = [
      'ID',
      'Title',
      'Date',
      'Time',
      'Location',
      'Status',
      'Available Tickets',
      'Price',
      'Category',
    ];

    // Convert each event to CSV row format
    const rows = this.filteredEvents.map((event) => {
      const date = new Date(event.date).toLocaleDateString();
      const time = event.time || 'N/A';
      return [
        event.id.toString(),
        event.title,
        date,
        time,
        event.location || 'N/A',
        event.status || 'inactive',
        event.available_tickets ? event.available_tickets.toString() : '0',
        event.price ? event.price.toString() : '0',
        event.category || 'General',
      ];
    });

    // Combine header and rows
    const csvContent = [
      header.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `events-export-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Apply preset date ranges
  applyDateRangePreset(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Reset dates
    this.startDate = undefined;
    this.endDate = undefined;

    switch (this.dateRangePreset) {
      case 'today':
        this.startDate = new Date(today);
        this.endDate = new Date(today);
        break;

      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        this.startDate = yesterday;
        this.endDate = yesterday;
        break;

      case 'thisWeek':
        const thisWeekStart = new Date(today);
        const dayOfWeek = thisWeekStart.getDay();
        const diff =
          thisWeekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is Sunday
        thisWeekStart.setDate(diff);
        this.startDate = new Date(thisWeekStart);

        const thisWeekEnd = new Date(thisWeekStart);
        thisWeekEnd.setDate(thisWeekEnd.getDate() + 6);
        this.endDate = thisWeekEnd;
        break;

      case 'lastWeek':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(
          lastWeekStart.getDate() -
            7 -
            lastWeekStart.getDay() +
            (lastWeekStart.getDay() === 0 ? -6 : 1)
        );
        this.startDate = new Date(lastWeekStart);

        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekEnd.getDate() + 6);
        this.endDate = lastWeekEnd;
        break;

      case 'thisMonth':
        const thisMonthStart = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );
        this.startDate = new Date(thisMonthStart);

        const thisMonthEnd = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        );
        this.endDate = thisMonthEnd;
        break;

      case 'lastMonth':
        const lastMonthStart = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        this.startDate = new Date(lastMonthStart);

        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        this.endDate = lastMonthEnd;
        break;

      case 'custom':
        // Don't set anything, let user choose
        break;

      default: // 'all'
        // Reset dates, include all
        break;
    }

    // Apply the filter
    this.filterEvents();
  }

  // Check if all events are selected
  isAllSelected(): boolean {
    return (
      this.filteredEvents.length > 0 &&
      this.selectedEvents.length === this.filteredEvents.length
    );
  }

  // Toggle selection of all events
  toggleAllSelection(): void {
    if (this.isAllSelected()) {
      this.selectedEvents = [];
    } else {
      this.selectedEvents = [...this.filteredEvents];
    }
  }

  // Toggle selection of a single event
  toggleEventSelection(event: Event): void {
    const index = this.selectedEvents.findIndex((e) => e.id === event.id);
    if (index === -1) {
      this.selectedEvents.push(event);
    } else {
      this.selectedEvents.splice(index, 1);
    }
  }

  // Check if an event is selected
  isEventSelected(event: Event): boolean {
    return this.selectedEvents.some((e) => e.id === event.id);
  }
  // Apply bulk action to selected events
  applyBulkAction(): void {
    if (this.selectedEvents.length === 0) {
      this.showToast('No events selected', 'warning');
      return;
    }

    switch (this.bulkAction) {
      case 'setActive':
        this.setStatusForSelected('active');
        break;
      case 'setInactive':
        this.setStatusForSelected('inactive');
        break;
      case 'delete':
        this.confirmBulkDelete();
        break;
      default:
        this.showToast('Please select an action', 'warning');
    }
  }
  // Set status for selected events
  setStatusForSelected(status: 'active' | 'inactive'): void {
    const count = this.selectedEvents.length;
    const selectedIds = this.selectedEvents.map((event) => event.id);

    this.isLoading = true;

    this.adminService.bulkUpdateEventStatus(selectedIds, status).subscribe({
      next: () => {
        // Clear selection
        this.selectedEvents = [];
        this.bulkAction = '';

        this.showToast(`Status updated for ${count} events`, 'success');
        this.loadEvents();
      },
      error: (err) => {
        this.showToast(
          'Error updating events: ' + (err.message || 'Unknown error'),
          'error'
        );
        this.isLoading = false;
      },
    });
  }

  // Confirm bulk delete
  confirmBulkDelete(): void {
    const count = this.selectedEvents.length;
    if (
      confirm(
        `Are you sure you want to delete ${count} events? This action cannot be undone.`
      )
    ) {
      this.bulkDeleteEvents();
    }
  }
  // Delete selected events
  bulkDeleteEvents(): void {
    const count = this.selectedEvents.length;
    const selectedIds = this.selectedEvents.map((event) => event.id);

    this.isLoading = true;

    this.adminService.bulkDeleteEvents(selectedIds).subscribe({
      next: () => {
        // Clear selection
        this.selectedEvents = [];
        this.bulkAction = '';

        this.showToast(`${count} events deleted successfully`, 'success');
        this.loadEvents();
      },
      error: (err) => {
        this.showToast(
          'Error deleting events: ' + (err.message || 'Unknown error'),
          'error'
        );
        this.isLoading = false;
      },
    });
  }
}
