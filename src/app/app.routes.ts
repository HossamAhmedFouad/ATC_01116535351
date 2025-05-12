import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { homeGuard } from './guards/home.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
    canActivate: [homeGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'events',
    loadComponent: () =>
      import('./pages/events/events.component').then((m) => m.EventsComponent),
  },
  {
    path: 'events/:id',
    loadComponent: () =>
      import('./pages/event-details/event-details.component').then(
        (m) => m.EventDetailsComponent
      ),
  },
  {
    path: 'payment',
    loadComponent: () =>
      import('./pages/payment/payment.component').then(
        (m) => m.PaymentComponent
      ),
  },
  {
    path: 'auth/signin',
    loadComponent: () =>
      import('./pages/auth/signin/signin.component').then(
        (m) => m.SigninComponent
      ),
  },
  {
    path: 'auth/signup',
    loadComponent: () =>
      import('./pages/auth/signup/signup.component').then(
        (m) => m.SignupComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'tickets',
    loadComponent: () =>
      import('./pages/tickets/tickets.component').then(
        (m) => m.TicketsComponent
      ),
    canActivate: [],
  },
  {
    path: 'admin/events',
    loadComponent: () =>
      import('./pages/admin/admin-events.component').then(
        (m) => m.AdminEventsComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
