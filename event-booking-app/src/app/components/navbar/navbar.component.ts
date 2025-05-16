import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isUserMenuOpen = false;
  isDarkMode = false;
  hasProfileImageError = false;
  private authSubscription: Subscription | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Subscribe to auth state changes
    this.authSubscription = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      // Close user menu when auth state changes
      this.isUserMenuOpen = false;
    });

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark-mode');
    }
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }

  logout() {
    this.authService.signOut();
    this.isUserMenuOpen = false;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }
  getProfilePicUrl(): string | null {
    if (this.hasProfileImageError || !this.currentUser?.profile_url) {
      return null;
    }
    return `${environment.supabase.url}/storage/v1/object/public/avatars/${this.currentUser.profile_url}`;
  }

  getInitials(): string {
    if (!this.currentUser?.username) return '';
    return this.currentUser.username.charAt(0).toUpperCase();
  }

  onProfileImageError(event: ErrorEvent): void {
    this.hasProfileImageError = true;
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.style.display = 'none';
    }
  }
}
