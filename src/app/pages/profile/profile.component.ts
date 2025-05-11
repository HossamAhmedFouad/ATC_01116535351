import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTableModule, MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { ThemePalette } from '@angular/material/core';
import { AuthService, User, BookedEvent } from '../../services/auth.service';
import { Router } from '@angular/router';
import moment from 'moment';
import { SidebarNavComponent, NavItem } from '../../components/sidebar-nav/sidebar-nav.component';
import { Subscription } from 'rxjs';

interface ProfileSettings {
  language: string;
  timezone: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDividerModule,
    MatTooltipModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatChipsModule,
    MatSnackBarModule,
    SidebarNavComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<BookedEvent>;

  user: User | null = null;
  isSidenavOpen = true;
  currentSection = 'personal-info';
  isLoading = false;
  isUpdating = false;
  userSubscription!: Subscription;
  
  // Navigation items
  navItems: NavItem[] = [
    {
      id: 'event-history',
      label: 'Events',
      icon: 'Events',
      badge: 0,
      badgeColor: 'warn'
    },
    {
      id: 'personal-info',
      label: 'Personal Info',
      icon: 'person'
    },
    {
      id: 'security',
      label: 'Security',
      icon: 'security'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings'
    }
  ];
  
  // Forms
  personalInfoForm!: FormGroup;
  securityForm!: FormGroup;
  settingsForm!: FormGroup;

  // Event History
  displayedColumns: string[] = ['title', 'date', 'status', 'price', 'actions'];
  eventHistory: BookedEvent[] = [];
  filteredEvents: BookedEvent[] = [];
  eventStatusFilter = 'all';
  currentPage = 1;
  itemsPerPage = 5; // Adjust as needed
  totalPages = 1;

  dataSource = new MatTableDataSource<BookedEvent>(this.filteredEvents);

  // Settings
  settings: ProfileSettings = {
    language: 'en',
    timezone: 'UTC'
  };

  languages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'Arabic' },
  ];

  timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'EST', label: 'Eastern Time' },
    { value: 'PST', label: 'Pacific Time' },
    { value: 'GMT', label: 'Greenwich Mean Time' },
    { value: 'CET', label: 'Central European Time' },
    { value: 'IST', label: 'Indian Standard Time' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.initializeForms();
  }

  private initializeForms(): void {
    this.personalInfoForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern('^[0-9-+()]*$')]],
      location: [''],
      bio: ['', [Validators.maxLength(500)]]
    });

    this.securityForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });

    this.settingsForm = this.fb.group({
      language: ['en'],
      timezone: ['UTC']
    });
  }

  ngOnInit() {
    this.loadUserData();
    this.loadEventHistory();
    this.setupFormSubscriptions();
    this.updateEventBadge();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.paginator.pageSize = this.itemsPerPage; // Explicitly set the page size
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe(); // Clean up the subscription
  }

  private setupFormSubscriptions(): void {
    this.settingsForm.get('darkMode')?.valueChanges.subscribe(isDark => {
      document.body.classList.toggle('dark-theme', isDark);
    });
  }

  private updateEventBadge() {
    const eventHistoryItem = this.navItems.find(item => item.id === 'event-history');
    if (eventHistoryItem) {
      eventHistoryItem.badge = this.getEventCount('upcoming');
    }
  }

  loadUserData() {
    this.isLoading = true;
    this.userSubscription = this.authService.currentUser$.subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
          this.personalInfoForm.patchValue({
            username: user.username,
            email: user.email,
            phone: user.phone || '',
            location: user.location || '',
            bio: user.bio || ''
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.showNotification('Error loading user data', 'error');
        this.isLoading = false;
      }
    });
  }

  loadEventHistory() {
    if (this.user?.bookedEvents) {
      this.eventHistory = [...this.user.bookedEvents].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      this.applyEventFilter();
    }
  }

  private applyEventFilter() {
    this.filteredEvents = this.eventStatusFilter === 'all'
      ? this.eventHistory
      : this.eventHistory.filter(event => event.status === this.eventStatusFilter);

    this.dataSource.data = this.filteredEvents;
    this.totalPages = Math.ceil(this.filteredEvents.length / this.itemsPerPage);
    if (this.paginator) {
      this.paginator.length = this.filteredEvents.length;
    }
  }

  filterEventsByStatus(status: string) {
    this.eventStatusFilter = status;
    this.applyEventFilter();
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  async updatePersonalInfo() {
    if (this.personalInfoForm.valid) {
      this.isUpdating = true;
      try {
        // TODO: Implement API call to update user info
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        this.showNotification('Profile updated successfully', 'success');
      } catch (error) {
        console.error('Error updating profile:', error);
        this.showNotification('Error updating profile', 'error');
      } finally {
        this.isUpdating = false;
      }
    }
  }

  async updatePassword() {
    if (this.securityForm.valid) {
      this.isUpdating = true;
      try {
        // TODO: Implement API call to update password
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        this.showNotification('Password updated successfully', 'success');
        this.securityForm.reset();
      } catch (error) {
        console.error('Error updating password:', error);
        this.showNotification('Error updating password', 'error');
      } finally {
        this.isUpdating = false;
      }
    }
  }

  async updateSettings() {
    if (this.settingsForm.valid) {
      this.isUpdating = true;
      try {
        this.settings = this.settingsForm.value;
        // TODO: Implement API call to update settings
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        this.showNotification('Settings updated successfully', 'success');
      } catch (error) {
        console.error('Error updating settings:', error);
        this.showNotification('Error updating settings', 'error');
      } finally {
        this.isUpdating = false;
      }
    }
  }

  toggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  navigateToSection(section: string) {
    this.currentSection = section;
    if (window.innerWidth < 768) {
      this.isSidenavOpen = false;
    }
  }

  formatDate(date: Date): string {
    return moment(date).format('MMM D, YYYY h:mm A');
  }

  getEventStatusClass(status: string): string {
    switch (status) {
      case 'upcoming': return 'status-upcoming';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'upcoming': return 'event_available';
      case 'completed': return 'task_alt';
      case 'cancelled': return 'event_busy';
      default: return 'help';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  viewEventDetails(eventId: number) {
    this.router.navigate(['/events', eventId]);
  }

  private showNotification(message: string, type: 'success' | 'error' = 'success') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }

  getEventCount(status: string): number {
    return this.eventHistory.filter(event => event.status === status).length;
  }

  getTotalSpent(): number {
    return this.eventHistory
      .filter(event => event.status !== 'cancelled')
      .reduce((total, event) => total + event.price, 0);
  }

  async cancelBooking(event: BookedEvent) {
    if (confirm(`Are you sure you want to cancel your booking for "${event.title}"?`)) {
      this.isUpdating = true;
      try {
        // TODO: Implement API call to cancel booking
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        
        // Update local state
        const eventIndex = this.eventHistory.findIndex(e => e.id === event.id);
        if (eventIndex !== -1) {
          this.eventHistory[eventIndex].status = 'cancelled';
          this.applyEventFilter();
        }
        
        this.showNotification('Booking cancelled successfully', 'success');
      } catch (error) {
        console.error('Error cancelling booking:', error);
        this.showNotification('Error cancelling booking', 'error');
      } finally {
        this.isUpdating = false;
      }
    }
  }

  get paginatedEvents() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredEvents.slice(startIndex, startIndex + this.itemsPerPage);
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
} 