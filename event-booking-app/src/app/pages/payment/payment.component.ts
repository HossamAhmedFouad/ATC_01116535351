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
      console.log('Query Parameters:', params); // Debug log

      this.eventId = params['eventId'];
      this.ticketCount = params['ticketCount']
        ? parseInt(params['ticketCount'])
        : undefined;
      this.totalAmount = params['totalAmount']
        ? parseFloat(params['totalAmount'])
        : undefined;

      console.log('Parsed Values:', {
        // Debug log
        eventId: this.eventId,
        ticketCount: this.ticketCount,
        totalAmount: this.totalAmount,
      });

      // Validate required parameters
      if (!this.eventId) {
        console.error('Missing event ID');
        this.toastService.error(
          'Missing event ID. Please try again from the event details page.'
        );
        this.router.navigate(['/events']);
        return;
      }

      if (!this.ticketCount) {
        console.error('Missing ticket count');
        this.toastService.error(
          'Missing ticket count. Please try again from the event details page.'
        );
        this.router.navigate(['/events']);
        return;
      }

      if (this.totalAmount === undefined) {
        console.error('Missing total amount');
        this.toastService.error(
          'Missing total amount. Please try again from the event details page.'
        );
        this.router.navigate(['/events']);
        return;
      }
    });
  }
  async onSubmit() {
    if (this.paymentForm.valid) {
      this.loading = true;
      try {
        console.log('Submitting with values:', {
          // Debug log
          eventId: this.eventId,
          ticketCount: this.ticketCount,
          totalAmount: this.totalAmount,
        });

        // Validate booking parameters again before proceeding
        if (!this.eventId) {
          throw new Error('Event ID is missing');
        }

        if (!this.ticketCount) {
          throw new Error('Ticket count is missing');
        }

        if (this.totalAmount === undefined) {
          throw new Error('Total amount is missing');
        }

        if (this.ticketCount <= 0) {
          throw new Error('Invalid ticket count');
        }

        if (this.totalAmount < 0) {
          throw new Error('Invalid amount');
        }

        const paymentData = {
          name: this.paymentForm.get('name')?.value,
          email: this.paymentForm.get('email')?.value,
          cardNumber: this.paymentForm.get('cardNumber')?.value,
          expiryDate: this.paymentForm.get('expiryDate')?.value,
          cvv: this.paymentForm.get('cvv')?.value,
          amount: this.totalAmount,
        };

        // Validate payment data
        if (
          !paymentData.name ||
          !paymentData.email ||
          !paymentData.cardNumber ||
          !paymentData.expiryDate ||
          !paymentData.cvv
        ) {
          throw new Error('Please fill in all payment details');
        }

        // Simulate payment processing
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve({ success: true });
          }, 1500);
        });

        // Create booking
        this.bookingService
          .bookEvent(this.eventId, this.ticketCount, this.totalAmount)
          .subscribe({
            next: (booking) => {
              this.booking = booking;
              this.tickets = booking.ticket_items || [];
              this.toastService.success('Booking confirmed successfully!');
              this.currentStep = 'complete';
              this.loading = false;
            },
            error: (error) => {
              console.error('Booking failed:', error);
              this.toastService.error(
                error.error?.message || 'Booking failed. Please try again.'
              );
              this.loading = false;
            },
          });
      } catch (error: any) {
        console.error('Payment processing failed:', error);
        this.toastService.error(
          error.message || 'Payment failed. Please try again.'
        );
        this.loading = false;
      }
    } else {
      this.toastService.error('Please fill in all required fields correctly.');
    }
  }
}
