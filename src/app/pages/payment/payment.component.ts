import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit {
  paymentForm: FormGroup;
  loading = false;
  eventId: string | undefined;
  ticketCount: number | undefined;
  totalAmount: number | undefined;
  event: any;
  currentStep = 'payment'; // 'payment' | 'complete'
  ticketId: string | undefined;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    public router: Router
  ) {
    this.paymentForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      cardNumber: ['', [Validators.required]],
      expiryDate: ['', [Validators.required]],
      cvv: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.eventId = params['eventId'];
      this.ticketCount = +params['ticketCount'];
      this.totalAmount = params['totalAmount'] ? +params['totalAmount'] : 0;
    });
  }
  async onSubmit() {
    if (this.paymentForm.valid) {
      this.loading = true;
      try {
        const paymentData = {
          name: this.paymentForm.get('name')?.value,
          email: this.paymentForm.get('email')?.value,
          cardNumber: this.paymentForm.get('cardNumber')?.value,
          expiryDate: this.paymentForm.get('expiryDate')?.value,
          cvv: this.paymentForm.get('cvv')?.value,
          amount: this.totalAmount,
        };

        // Mocking the Paymob API call for now
        const response = await new Promise((resolve) => {
          setTimeout(() => {
            resolve({ success: true });
          }, 1000); // Simulate a 1-second delay
        });

        // Generate a ticket ID
        this.ticketId = `TKT-${Math.random()
          .toString(36)
          .substr(2, 9)
          .toUpperCase()}`;
        this.currentStep = 'complete';
        this.router.navigate(['/events']);
      } catch (error) {
        console.error('Payment failed:', error);
        alert('Payment failed. Please try again.');
      } finally {
        this.loading = false;
      }
    }
  }
}
