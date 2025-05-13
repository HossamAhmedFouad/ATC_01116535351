import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class SigninComponent {
  signinForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.signinForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { email, password } = this.signinForm.value;
      this.authService.signIn(email, password).subscribe({
        next: () => {
          this.router.navigate(['/events']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error.message || 'An error occurred during sign in';
        }
      });
    }
  }

  signInWithGoogle(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.signInWithGoogle().subscribe({
      next: () => {
        this.router.navigate(['/events']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error.message || 'An error occurred during Google sign in';
      }
    });
  }
} 