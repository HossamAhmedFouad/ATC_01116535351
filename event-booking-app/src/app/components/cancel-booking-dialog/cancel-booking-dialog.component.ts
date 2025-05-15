import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface CancelBookingDialogData {
  bookingId: string;
  eventTitle: string;
  ticketsCount: number;
}

@Component({
  selector: 'app-cancel-booking-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="cancel-dialog-container">
      <div class="cancel-dialog-header">
        <h2 class="dialog-title">Cancel Booking</h2>
        <button mat-icon-button class="close-button" (click)="onNoClick()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="cancel-dialog-content">
        <div class="warning-icon">
          <mat-icon>warning</mat-icon>
        </div>

        <h3>Are you sure you want to cancel this booking?</h3>

        <div class="booking-details">
          <p class="event-title">{{ data.eventTitle }}</p>
          <p class="ticket-count">
            {{ data.ticketsCount }} ticket{{
              data.ticketsCount !== 1 ? 's' : ''
            }}
            will be cancelled
          </p>
        </div>

        <div class="warning-text">
          <p>
            This action cannot be undone. All tickets associated with this
            booking will be cancelled and you won't be able to use them for
            event entry.
          </p>
        </div>
      </div>

      <div class="cancel-dialog-actions">
        <button mat-button class="cancel-button" (click)="onNoClick()">
          <mat-icon>arrow_back</mat-icon> Keep Booking
        </button>
        <button
          mat-raised-button
          color="warn"
          class="confirm-button"
          (click)="onYesClick()"
        >
          <mat-icon>cancel</mat-icon> Cancel Booking
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .cancel-dialog-container {
        padding: 0;
        max-width: 500px;
      }

      .cancel-dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        background: var(
          --primary-gradient,
          linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)
        );
        color: white;
        border-radius: 4px 4px 0 0;
      }

      .dialog-title {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }

      .close-button {
        color: white;
      }

      .cancel-dialog-content {
        padding: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .warning-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 64px;
        height: 64px;
        background-color: #fee2e2;
        color: #ef4444;
        border-radius: 50%;
        margin-bottom: 16px;
      }

      .warning-icon mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      h3 {
        margin: 0 0 16px 0;
        font-weight: 500;
        color: var(--text-primary);
      }

      .booking-details {
        background-color: var(--surface-hover, #f8fafc);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        width: 100%;
        border: 1px solid var(--border-color, #e2e8f0);
      }

      .event-title {
        margin: 0 0 8px 0;
        font-weight: 500;
        font-size: 16px;
        color: var(--text-primary);
      }

      .ticket-count {
        margin: 0;
        color: var(--text-secondary);
        font-size: 14px;
      }

      .warning-text {
        color: var(--text-secondary);
        font-size: 14px;
        margin-bottom: 16px;
      }

      .cancel-dialog-actions {
        display: flex;
        justify-content: flex-end;
        padding: 16px 24px;
        gap: 16px;
        border-top: 1px solid var(--border-color, #e2e8f0);
      }

      .cancel-button,
      .confirm-button {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      /* Dark mode styles */
      :host-context(.dark-mode) .warning-icon {
        background-color: rgba(239, 68, 68, 0.2);
      }

      :host-context(.dark-mode) h3 {
        color: var(--text-primary, #f1f5f9);
      }

      :host-context(.dark-mode) .booking-details {
        background-color: var(--surface-color, #1e293b);
        border-color: var(--border-color, #334155);
      }

      :host-context(.dark-mode) .event-title {
        color: var(--text-primary, #f1f5f9);
      }

      :host-context(.dark-mode) .ticket-count {
        color: var(--text-secondary, #94a3b8);
      }

      :host-context(.dark-mode) .warning-text {
        color: var(--text-secondary, #94a3b8);
      }

      :host-context(.dark-mode) .cancel-dialog-actions {
        border-color: var(--border-color, #334155);
      }
    `,
  ],
})
export class CancelBookingDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CancelBookingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CancelBookingDialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}
