import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-container" [ngClass]="{ 'full-page': fullPage }">
      <div class="spinner-container">
        <div class="spinner"></div>
        <p *ngIf="message" class="loading-message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .loader-container {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 2rem;
        width: 100%;
        min-height: 200px;
      }

      .full-page {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.8);
        z-index: 9999;
        min-height: 100vh;
      }

      .spinner-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .spinner {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(79, 70, 229, 0.2);
        border-radius: 50%;
        border-top-color: #4f46e5;
        animation: spin 1s ease-in-out infinite;
      }

      .loading-message {
        margin-top: 1rem;
        font-size: 0.875rem;
        color: #4b5563;
        text-align: center;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      :host-context(.dark-mode) .loader-container.full-page {
        background-color: rgba(26, 26, 26, 0.8);
      }

      :host-context(.dark-mode) .loading-message {
        color: #e5e7eb;
      }

      :host-context(.dark-mode) .spinner {
        border-color: rgba(129, 140, 248, 0.2);
        border-top-color: #818cf8;
      }
    `,
  ],
})
export class LoaderComponent {
  @Input() message: string = '';
  @Input() fullPage: boolean = false;
}
