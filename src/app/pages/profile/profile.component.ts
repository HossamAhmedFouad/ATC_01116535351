import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ThemePalette } from '@angular/material/core';
import { AuthService, User } from '../../services/auth.service';
import { Router } from '@angular/router';
import {
  SidebarNavComponent,
  NavItem,
} from '../../components/sidebar-nav/sidebar-nav.component';
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
    MatDividerModule,
    MatTooltipModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    SidebarNavComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isSidenavOpen = true;
  currentSection = 'personal-info';
  isLoading = false;
  isUpdating = false;
  userSubscription!: Subscription;

  // Navigation items
  navItems: NavItem[] = [
    {
      id: 'personal-info',
      label: 'Personal Info',
      icon: 'person',
    },
    {
      id: 'security',
      label: 'Security',
      icon: 'security',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
    },
  ];

  // Forms
  personalInfoForm!: FormGroup;
  securityForm!: FormGroup;
  settingsForm!: FormGroup;

  // Settings
  settings: ProfileSettings = {
    language: 'en',
    timezone: 'UTC',
  };

  languages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'Arabic' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
  ];

  timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'EST', label: 'Eastern Time' },
    { value: 'PST', label: 'Pacific Time' },
    { value: 'GMT', label: 'Greenwich Mean Time' },
    { value: 'CET', label: 'Central European Time' },
    { value: 'IST', label: 'Indian Standard Time' },
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
      bio: ['', [Validators.maxLength(500)]],
    });

    this.securityForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validator: this.passwordMatchValidator }
    );

    this.settingsForm = this.fb.group({
      language: ['en'],
      timezone: ['UTC'],
    });
  }

  ngOnInit() {
    this.loadUserData();
    this.setupFormSubscriptions();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe(); // Clean up the subscription
    }
  }

  private setupFormSubscriptions(): void {
    // Add any form subscriptions if needed
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
            bio: user.bio || '',
          });

          // Load settings from user preferences if they exist
          if (user.phone) this.settingsForm.get('language')?.setValue('en');
          if (user.location) this.settingsForm.get('timezone')?.setValue('UTC');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.showNotification('Error loading user data', 'error');
        this.isLoading = false;
      },
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  async updatePersonalInfo() {
    if (this.personalInfoForm.valid) {
      this.isUpdating = true;
      try {
        const updatedInfo = this.personalInfoForm.value;
        // TODO: Implement API call to update user info
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

        // Update local user data
        if (this.user) {
          this.user = {
            ...this.user,
            ...updatedInfo,
          };
        }

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
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
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
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

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

  private showNotification(
    message: string,
    type: 'success' | 'error' = 'success'
  ) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass:
        type === 'success' ? ['success-snackbar'] : ['error-snackbar'],
    });
  }
}
