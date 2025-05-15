import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { User, AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { FileUploadComponent } from '../../components/file-upload/file-upload.component';
import { UploadResponse } from '../../services/assets.service';
import { environment } from '../../../environments/environment';

interface AccountSetting {
  name: string;
  description: string;
  icon: string;
  action: () => void;
}

interface UserForm extends Partial<User> {}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FileUploadComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  isEditing = false;
  userForm: UserForm = {};
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  selectedTab: 'profile' | 'settings' = 'profile';
  isChangingPassword = false;
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
      this.setupAccountSettings();
      this.calculateUserStats();
    }
  }

  calculateUserStats(): void {
    if (this.currentUser?.bookedEvents) {
      this.totalBookings = this.currentUser.bookedEvents.length;

      // Calculate unique events
      const uniqueEventIds = new Set();
      this.currentUser.bookedEvents.forEach((booking) => {
        if (booking.event_id) {
          uniqueEventIds.add(booking.event_id);
        }
      });
      this.totalEvents = uniqueEventIds.size;
    }
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
    ];
  }

  // Tab navigation
  switchTab(tab: 'profile' | 'settings'): void {
    this.selectedTab = tab;
    // Close any open forms when switching tabs
    this.isEditing = false;
    this.isChangingPassword = false;
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

    if (this.passwordForm.newPassword.length < 6) {
      this.errorMessage = 'New password must be at least 6 characters long';
      return;
    }

    this.isLoading = true;
    this.userService
      .changePassword(
        this.passwordForm.currentPassword,
        this.passwordForm.newPassword
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Password changed successfully';
          this.isChangingPassword = false;
          this.isLoading = false;
          this.passwordForm = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          };
        },
        error: (error: Error) => {
          this.errorMessage = error.message || 'Failed to change password';
          this.isLoading = false;
        },
      });
  }

  // Settings methods
  downloadUserData(): void {
    this.successMessage = 'Your data is being prepared for download';

    if (this.currentUser) {
      const userData = JSON.stringify(this.currentUser, null, 2);
      const blob = new Blob([userData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${this.currentUser.username}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
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
  onProfilePicUploaded(response: UploadResponse) {
    // Store the file path and let getProfilePicUrl handle the URL construction
    this.userForm.profile_url = response.path;

    // Save the profile immediately when picture is uploaded
    this.userService
      .updateUserProfile({ profile_url: response.path })
      .subscribe({
        next: (updatedUser) => {
          this.currentUser = updatedUser;
          this.successMessage = 'Profile picture uploaded successfully';
        },
        error: (error) => {
          this.errorMessage =
            error.message || 'Failed to update profile picture';
        },
      });
  }

  onProfilePicError(error: Error) {
    this.errorMessage = error.message || 'Failed to upload profile picture';
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

    this.userService.updateUserProfile(this.userForm).subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser;
        this.isLoading = false;
        this.isEditing = false;
        this.successMessage = 'Profile updated successfully!';
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Failed to update profile';
      },
    });
  }
  getProfilePicUrl(): string | null {
    if (!this.currentUser?.profile_url) {
      return null;
    }

    // If the profile_url is already a full URL, use it
    if (this.currentUser.profile_url.startsWith('http')) {
      return this.currentUser.profile_url;
    }

    // Otherwise construct the storage URL
    console.log(
      `${environment.supabase.url}/storage/v1/object/public/avatars/${this.currentUser.profile_url}`
    );
    return `${environment.supabase.url}/storage/v1/object/public/avatars/${this.currentUser.profile_url}`;
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

  // Handle profile image loading errors
  onProfileImageError(event: ErrorEvent): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.style.display = 'none'; // Hide the broken image
    }
    this.errorMessage = 'Failed to load profile picture';
    // Clear the profile URL so the initials avatar shows instead
    if (this.currentUser) {
      this.currentUser.profile_url = '';
    }
  }
}
