import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormArray,
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
  schedule?: ScheduleDay[];
  // UI-specific fields
  status?: 'active' | 'inactive';
  bookingsCount?: number;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ScheduleDay {
  day: string;
  events: ScheduleEvent[];
}

interface ScheduleEvent {
  time: string;
  title: string;
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
      schedule: this.fb.array([this.createScheduleDay()]),
    });
  }
  // Create a new schedule day form group
  createScheduleDay(): FormGroup {
    return this.fb.group({
      day: ['Day 1'],
      events: this.fb.array([this.createScheduleEvent()]),
    });
  }

  // Create a new schedule event form group
  createScheduleEvent(): FormGroup {
    return this.fb.group({
      time: ['09:00 AM'],
      title: [''],
    });
  }

  // Schedule form helpers
  get scheduleDays(): FormArray {
    return this.eventForm.get('schedule') as FormArray;
  }

  getScheduleEvents(dayIndex: number): FormArray {
    return this.scheduleDays.at(dayIndex).get('events') as FormArray;
  }

  addScheduleDay(): void {
    const dayNumber = this.scheduleDays.length + 1;
    const newDay = this.fb.group({
      day: [`Day ${dayNumber}`],
      events: this.fb.array([this.createScheduleEvent()]),
    });
    this.scheduleDays.push(newDay);
  }

  removeScheduleDay(dayIndex: number): void {
    if (this.scheduleDays.length > 1) {
      this.scheduleDays.removeAt(dayIndex);
    }
  }

  addScheduleEvent(dayIndex: number): void {
    const events = this.getScheduleEvents(dayIndex);
    events.push(this.createScheduleEvent());
  }

  removeScheduleEvent(dayIndex: number, eventIndex: number): void {
    const events = this.getScheduleEvents(dayIndex);
    if (events.length > 1) {
      events.removeAt(eventIndex);
    }
  }

  // Move a schedule event up in the list
  moveEventUp(dayIndex: number, eventIndex: number): void {
    if (eventIndex <= 0) return;

    const events = this.getScheduleEvents(dayIndex);
    const eventToMove = events.at(eventIndex).value;
    const newIndex = eventIndex - 1;

    events.removeAt(eventIndex);
    events.insert(
      newIndex,
      this.fb.group({
        time: [eventToMove.time],
        title: [eventToMove.title],
      })
    );
  }

  // Move a schedule event down in the list
  moveEventDown(dayIndex: number, eventIndex: number): void {
    const events = this.getScheduleEvents(dayIndex);
    if (eventIndex >= events.length - 1) return;

    const eventToMove = events.at(eventIndex).value;
    const newIndex = eventIndex + 1;

    events.removeAt(eventIndex);
    events.insert(
      newIndex,
      this.fb.group({
        time: [eventToMove.time],
        title: [eventToMove.title],
      })
    );
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
    this.initEventForm();
    this.eventForm.patchValue({
      status: 'active',
      date: new Date().toISOString().split('T')[0],
    });

    // Create a default schedule with common event time slots
    this.createDefaultSchedule();

    this.showEventModal = true;
  }

  // Create a default schedule with common event timeslots
  createDefaultSchedule(): void {
    const scheduleFormArray = this.eventForm.get('schedule') as FormArray;

    // Clear existing schedule
    while (scheduleFormArray.length) {
      scheduleFormArray.removeAt(0);
    }

    // Create a default day
    const dayGroup = this.fb.group({
      day: ['Day 1'],
      events: this.fb.array([]),
    });

    // Get events form array for this day
    const eventsArray = dayGroup.get('events') as FormArray;

    // Add common event time slots
    const commonTimeSlots = [
      { time: '08:00 AM', title: 'Registration & Check-in' },
      { time: '09:00 AM', title: 'Opening Session' },
      { time: '10:30 AM', title: 'Morning Break' },
      { time: '11:00 AM', title: 'Main Presentation' },
      { time: '12:30 PM', title: 'Lunch Break' },
      { time: '02:00 PM', title: 'Afternoon Session' },
      { time: '03:30 PM', title: 'Networking Break' },
      { time: '04:00 PM', title: 'Closing Remarks' },
    ];

    commonTimeSlots.forEach((slot) => {
      eventsArray.push(
        this.fb.group({
          time: [slot.time],
          title: [slot.title],
        })
      );
    });

    // Add the day to the schedule
    scheduleFormArray.push(dayGroup);
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

    // Reset the form with new FormArrays for schedule
    this.eventForm = this.fb.group({
      id: [event.id],
      title: [event.title, Validators.required],
      date: [formattedDate, Validators.required],
      time: [eventTime],
      location: [event.location || ''],
      description: [event.description || ''],
      status: [status],
      available_tickets: [
        event.available_tickets || 0,
        [Validators.required, Validators.min(0)],
      ],
      image_url: [event.image_url || ''],
      price: [event.price || 0, [Validators.min(0)]],
      category: [event.category || 'General'],
      duration: [event.duration || '2 hours'],
      organizer: [event.organizer || 'Event System'],
      schedule: this.fb.array([]),
    }); // Populate schedule FormArray if it exists
    if (event.schedule && Array.isArray(event.schedule)) {
      const scheduleFormArray = this.eventForm.get('schedule') as FormArray;

      // Clear existing form array items
      while (scheduleFormArray.length) {
        scheduleFormArray.removeAt(0);
      } // Add each schedule day from the event data
      event.schedule.forEach((day: ScheduleDay) => {
        const dayGroup = this.fb.group({
          day: [day.day || ''],
          events: this.fb.array([]),
        });

        // Get events form array for this day
        const eventsArray = dayGroup.get('events') as FormArray;

        // Add each event in this day
        if (day.events && Array.isArray(day.events)) {
          day.events.forEach((scheduleEvent: ScheduleEvent) => {
            eventsArray.push(
              this.fb.group({
                time: [scheduleEvent.time || ''],
                title: [scheduleEvent.title || ''],
              })
            );
          });
        }

        // Add the day with its events to the schedule
        scheduleFormArray.push(dayGroup);
      });
    } else {
      // If no schedule, create a default one
      const scheduleFormArray = this.eventForm.get('schedule') as FormArray;
      scheduleFormArray.push(this.createScheduleDay());
    }

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

    // Convert FormArray schedule to array of objects
    if (formData.schedule && Array.isArray(formData.schedule)) {
      // Already structured correctly from FormArray
      // No need for JSON parsing
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

  // Add a template schedule based on event type
  addScheduleTemplate(templateType: string): void {
    const scheduleFormArray = this.eventForm.get('schedule') as FormArray;

    // Clear existing schedule
    while (scheduleFormArray.length) {
      scheduleFormArray.removeAt(0);
    }

    switch (templateType) {
      case 'conference':
        this.addConferenceTemplate(scheduleFormArray);
        break;
      case 'workshop':
        this.addWorkshopTemplate(scheduleFormArray);
        break;
      case 'festival':
        this.addFestivalTemplate(scheduleFormArray);
        break;
      default:
        // Just add a default day
        scheduleFormArray.push(this.createScheduleDay());
    }
  }

  // Add a conference template (2 days)
  private addConferenceTemplate(scheduleFormArray: FormArray): void {
    // Day 1
    const day1 = this.fb.group({
      day: ['Day 1'],
      events: this.fb.array([]),
    });

    const day1Events = day1.get('events') as FormArray;

    [
      { time: '08:00 AM', title: 'Registration & Welcome Coffee' },
      { time: '09:00 AM', title: 'Opening Keynote' },
      { time: '10:30 AM', title: 'Panel Discussion' },
      { time: '12:00 PM', title: 'Lunch Break' },
      { time: '01:30 PM', title: 'Breakout Sessions' },
      { time: '03:00 PM', title: 'Networking Break' },
      { time: '03:30 PM', title: 'Workshop Sessions' },
      { time: '05:00 PM', title: 'Day 1 Closing Remarks' },
      { time: '06:30 PM', title: 'Welcome Reception' },
    ].forEach((event) => {
      day1Events.push(
        this.fb.group({
          time: [event.time],
          title: [event.title],
        })
      );
    });

    // Day 2
    const day2 = this.fb.group({
      day: ['Day 2'],
      events: this.fb.array([]),
    });

    const day2Events = day2.get('events') as FormArray;

    [
      { time: '08:30 AM', title: 'Morning Coffee' },
      { time: '09:00 AM', title: 'Keynote Speaker' },
      { time: '10:30 AM', title: 'Technical Sessions' },
      { time: '12:00 PM', title: 'Lunch Break' },
      { time: '01:30 PM', title: 'Industry Insights' },
      { time: '03:00 PM', title: 'Coffee Break' },
      { time: '03:30 PM', title: 'Closing Panel' },
      { time: '05:00 PM', title: 'Farewell & Networking' },
    ].forEach((event) => {
      day2Events.push(
        this.fb.group({
          time: [event.time],
          title: [event.title],
        })
      );
    });

    scheduleFormArray.push(day1);
    scheduleFormArray.push(day2);
  }

  // Add a workshop template (1 day)
  private addWorkshopTemplate(scheduleFormArray: FormArray): void {
    const day = this.fb.group({
      day: ['Workshop Day'],
      events: this.fb.array([]),
    });

    const dayEvents = day.get('events') as FormArray;

    [
      { time: '08:30 AM', title: 'Registration & Materials' },
      { time: '09:00 AM', title: 'Introduction & Overview' },
      { time: '09:30 AM', title: 'Workshop Module 1' },
      { time: '11:00 AM', title: 'Coffee Break' },
      { time: '11:15 AM', title: 'Workshop Module 2' },
      { time: '12:30 PM', title: 'Lunch Break' },
      { time: '01:30 PM', title: 'Workshop Module 3' },
      { time: '03:00 PM', title: 'Afternoon Break' },
      { time: '03:15 PM', title: 'Workshop Module 4' },
      { time: '04:30 PM', title: 'Q&A Session' },
      { time: '05:00 PM', title: 'Certificates & Closing' },
    ].forEach((event) => {
      dayEvents.push(
        this.fb.group({
          time: [event.time],
          title: [event.title],
        })
      );
    });

    scheduleFormArray.push(day);
  }

  // Add a festival template (2 days)
  private addFestivalTemplate(scheduleFormArray: FormArray): void {
    // Day 1
    const day1 = this.fb.group({
      day: ['Day 1'],
      events: this.fb.array([]),
    });

    const day1Events = day1.get('events') as FormArray;

    [
      { time: '12:00 PM', title: 'Gates Open' },
      { time: '01:00 PM', title: 'Opening Act' },
      { time: '02:30 PM', title: 'Food & Beverage Stalls Open' },
      { time: '03:00 PM', title: 'Main Stage Performance 1' },
      { time: '04:30 PM', title: 'Interactive Activities Begin' },
      { time: '06:00 PM', title: 'Main Stage Performance 2' },
      { time: '08:00 PM', title: 'Headliner Performance' },
      { time: '10:00 PM', title: 'Day 1 Closing' },
    ].forEach((event) => {
      day1Events.push(
        this.fb.group({
          time: [event.time],
          title: [event.title],
        })
      );
    });

    // Day 2
    const day2 = this.fb.group({
      day: ['Day 2'],
      events: this.fb.array([]),
    });

    const day2Events = day2.get('events') as FormArray;

    [
      { time: '12:00 PM', title: 'Gates Open' },
      { time: '01:00 PM', title: 'Opening Performance' },
      { time: '02:30 PM', title: 'Art Exhibition Opens' },
      { time: '03:30 PM', title: 'Special Guest Performance' },
      { time: '05:00 PM', title: 'Community Showcase' },
      { time: '06:30 PM', title: 'Award Ceremony' },
      { time: '08:00 PM', title: 'Final Performance' },
      { time: '10:00 PM', title: 'Festival Closing & Fireworks' },
    ].forEach((event) => {
      day2Events.push(
        this.fb.group({
          time: [event.time],
          title: [event.title],
        })
      );
    });

    scheduleFormArray.push(day1);
    scheduleFormArray.push(day2);
  }
}
