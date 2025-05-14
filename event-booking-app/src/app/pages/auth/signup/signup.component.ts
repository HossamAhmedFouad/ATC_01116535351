import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
})
export class SignupComponent {
  signupForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern('^[a-zA-Z0-9_]+$'),
        ],
      ],
      location: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.signUp(this.signupForm.value).subscribe({
        next: () => {
          this.toastService.success(
            'Account created successfully! Welcome aboard!'
          );
          this.router.navigate(['/events']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage =
            error.message || 'An error occurred during sign up';
          this.toastService.error(this.errorMessage, 'Sign Up Failed');
        },
      });
    }
  }

  signUpWithGoogle(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.signInWithGoogle().subscribe({
      next: () => {
        this.toastService.success('Google sign up successful! Welcome aboard!');
        this.router.navigate(['/events']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error.message || 'An error occurred during Google sign up';
        this.toastService.error(this.errorMessage, 'Google Sign Up Failed');
      },
    });
  }
}
