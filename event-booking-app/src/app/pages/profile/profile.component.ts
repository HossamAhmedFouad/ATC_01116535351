import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { User, AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

interface AccountSetting {
  name: string;
  description: string;
  icon: string;
  action: () => void;
}

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface ActivityItem {
  id: number;
  type: 'booking' | 'event' | 'payment';
  title: string;
  date: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  isEditing = false;
  userForm: Partial<User> = {};
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  selectedTab: 'profile' | 'activity' | 'settings' = 'profile';
  isChangingPassword = false;
  isChangingLanguage = false;
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  // Extended profile properties
  memberSince: string = '2023-01-15';
  totalEvents: number = 0;
  totalBookings: number = 0;
  lastLoginDate: string = '2023-05-10';

  // Language settings
  currentLanguage: string = 'en';
  availableLanguages: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'Arabic', flag: 'AR' },
  ];

  // Mock activity data
  recentActivity: ActivityItem[] = [];

  // Account settings options
  accountSettings: AccountSetting[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}
  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.resetForm();
      this.loadMockData();
      this.setupAccountSettings();
      this.calculateUserStats();
    }

    // Check for saved language preference
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      this.currentLanguage = savedLanguage;
    }
  }
  calculateUserStats(): void {
    if (this.currentUser?.bookedEvents) {
      this.totalBookings = this.currentUser.bookedEvents.length;

      // Calculate unique events (for demo purposes)
      const uniqueEventIds = new Set();
      this.currentUser.bookedEvents.forEach((booking) => {
        if (booking.event_id) {
          uniqueEventIds.add(booking.event_id);
        }
      });
      this.totalEvents = uniqueEventIds.size;
    }
  }

  loadMockData(): void {
    // Create some mock activity data
    this.recentActivity = [
      {
        id: 1,
        type: 'booking',
        title: 'Booked a ticket',
        date: '2025-05-10',
        description: 'Booked a ticket for Tech Conference 2025',
        icon: 'event_available',
      },
      {
        id: 2,
        type: 'payment',
        title: 'Payment completed',
        date: '2025-05-10',
        description: 'Payment for Tech Conference 2025',
        icon: 'payments',
      },
      {
        id: 3,
        type: 'event',
        title: 'Attended an event',
        date: '2025-04-15',
        description: 'Attended Spring Music Festival',
        icon: 'event_note',
      },
    ];
  }
  setupAccountSettings(): void {
    this.accountSettings = [
      {
        name: 'Change Password',
        description: 'Update your account password',
        icon: 'lock',
        action: () => this.togglePasswordForm(),
      },
      {
        name: 'Download Your Data',
        description: 'Get a copy of your personal data',
        icon: 'cloud_download',
        action: () => this.downloadUserData(),
      },
      {
        name: 'Change Language',
        description: 'Select your preferred language',
        icon: 'language',
        action: () => this.toggleLanguageSelector(),
      },
    ];
  }
  // Tab navigation
  switchTab(tab: 'profile' | 'activity' | 'settings'): void {
    this.selectedTab = tab;
    // Close any open forms when switching tabs
    this.isEditing = false;
    this.isChangingPassword = false;
    this.isChangingLanguage = false;
    this.resetMessages();
  }

  // Password management
  togglePasswordForm(): void {
    this.isChangingPassword = !this.isChangingPassword;
    if (this.isChangingPassword) {
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      };
    }
    this.resetMessages();
  }

  changePassword(): void {
    // Validate form
    if (
      !this.passwordForm.currentPassword ||
      !this.passwordForm.newPassword ||
      !this.passwordForm.confirmPassword
    ) {
      this.errorMessage = 'All password fields are required';
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.errorMessage = 'New passwords do not match';
      return;
    }

    // In a real app, this would call an API
    this.isLoading = true;

    setTimeout(() => {
      this.isLoading = false;
      this.successMessage = 'Password changed successfully';
      this.isChangingPassword = false;
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      };
    }, 1000);
  }

  // Settings methods
  openNotificationSettings(): void {
    this.successMessage = 'Notification settings feature coming soon';
  }

  openPrivacySettings(): void {
    this.successMessage = 'Privacy settings feature coming soon';
  }

  downloadUserData(): void {
    this.successMessage = 'Your data is being prepared for download';

    // In a real app, this would trigger a backend process to compile user data
    setTimeout(() => {
      if (this.currentUser) {
        // Create a JSON blob with user data
        const userData = JSON.stringify(this.currentUser, null, 2);
        const blob = new Blob([userData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Create a download link and trigger it
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-data-${this.currentUser.username}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }, 1500);
  }

  // File upload handler
  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];

      // In a real app, you would upload to a server
      // For now, we'll use FileReader to create a data URL
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.userForm.profile_url = reader.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  resetMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
  resetForm(): void {
    if (this.currentUser) {
      this.userForm = {
        username: this.currentUser.username,
        email: this.currentUser.email,
        phone: this.currentUser.phone || '',
        location: this.currentUser.location || '',
        bio: this.currentUser.bio || '',
        profile_url: this.currentUser.profile_url || '',
        // Add any additional fields you want to include
      };

      // Calculate statistics based on current user data
      if (this.currentUser.bookedEvents) {
        this.totalBookings = this.currentUser.bookedEvents.length;
      }
    }
  }

  startEditing(): void {
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.resetForm();
    this.successMessage = '';
    this.errorMessage = '';
  }

  saveProfile(): void {
    if (!this.currentUser) return;

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    // In a real app, this would send data to the backend
    // For this demo, we'll simulate an API call
    setTimeout(() => {
      if (this.currentUser) {
        // Update the current user with form values
        const updatedUser: User = {
          ...this.currentUser,
          ...this.userForm,
        };

        // Update in local storage (simulating backend update)
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        // Update the auth service
        this.authService['currentUserSubject'].next(updatedUser);
        this.currentUser = updatedUser;

        this.isLoading = false;
        this.isEditing = false;
        this.successMessage = 'Profile updated successfully!';
      }
    }, 1000);
  }

  // Helper to generate initials for avatar
  getInitials(): string {
    if (!this.currentUser?.username) return '?';

    const nameParts = this.currentUser.username.split(' ');
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return this.currentUser.username.substring(0, 2).toUpperCase();
  }

  // Generate a random color based on username for avatar
  getAvatarColor(): string {
    if (!this.currentUser?.username) return '#007bff';

    // Simple hash function to generate color from username
    let hash = 0;
    for (let i = 0; i < this.currentUser.username.length; i++) {
      hash = this.currentUser.username.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert to hex color
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ('00' + value.toString(16)).substr(-2);
    }

    return color;
  }

  // Language selector
  toggleLanguageSelector(): void {
    this.isChangingLanguage = !this.isChangingLanguage;
    this.resetMessages();
  }

  changeLanguage(languageCode: string): void {
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    // In a real app, this would call an API and update app settings
    setTimeout(() => {
      this.currentLanguage = languageCode;
      this.isLoading = false;
      this.isChangingLanguage = false;

      // Get the language name for the message
      const selectedLanguage = this.availableLanguages.find(
        (lang) => lang.code === languageCode
      );
      this.successMessage = `Language changed to ${
        selectedLanguage?.name || languageCode
      }`;

      // In a real app, this would update a language service
      localStorage.setItem('preferredLanguage', languageCode);
    }, 1000);
  }

  // Helper to get language name by code
  getLanguageName(code: string): string {
    const language = this.availableLanguages.find((l) => l.code === code);
    return language ? language.name : 'English';
  }
}
