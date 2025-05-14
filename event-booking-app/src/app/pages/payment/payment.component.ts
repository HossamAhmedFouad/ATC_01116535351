import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  BookingService,
  Booking,
  Ticket,
} from '../../services/booking.service';
import { ToastService } from '../../services/toast.service';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  providers: [BookingService, ToastService, EventService],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit {
  paymentForm!: FormGroup;
  loading = false;
  eventId: string | undefined;
  ticketCount: number | undefined;
  totalAmount: number | undefined;
  event: any;
  currentStep: 'payment' | 'complete' = 'payment';
  booking: Booking | null = null;
  tickets: Ticket[] = [];
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    public router: Router,
    private bookingService: BookingService,
    private eventService: EventService,
    private toastService: ToastService
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

        // Simulate payment processing
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve({ success: true });
          }, 1500); // Simulate a 1.5-second delay
        });

        // Create booking and generate tickets using BookingService
        if (this.eventId && this.ticketCount && this.totalAmount) {
          this.bookingService
            .bookEvent(this.eventId, this.ticketCount, this.totalAmount)
            .subscribe({
              next: (booking) => {
                this.booking = booking;
                this.tickets = booking.ticket_items || [];

                // Clear event cache to ensure up-to-date data when returning to event details
                if (this.eventId) {
                  this.eventService.clearEventCache(this.eventId);
                }

                this.toastService.success('Booking confirmed successfully!');
                // Update step to show success state
                this.currentStep = 'complete';
                this.loading = false;
              },
              error: (error) => {
                console.error('Booking failed:', error);
                this.toastService.error('Booking failed. Please try again.');
                this.loading = false;
              },
            });
        } else {
          throw new Error('Missing booking information');
        }
      } catch (error) {
        console.error('Payment processing failed:', error);
        this.toastService.error('Payment failed. Please try again.');
        this.loading = false;
      }
    }
  }
}
