import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  const currentUser = authService.getCurrentUser();

  if (currentUser && currentUser.role === 'ADMIN') {
    return true;
  }

  // If not an admin, show a message and redirect to home
  snackBar.open('Access denied. Admin privileges required.', 'Close', {
    duration: 3000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
  });

  router.navigate(['/']);
  return false;
};
