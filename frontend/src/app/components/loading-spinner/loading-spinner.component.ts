import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-container" [class.overlay]="overlay">
      <div class="spinner"></div>
      <p *ngIf="message" class="spinner-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2.5rem;
    }
    .spinner-container.overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 41, 66, 0.4);
      backdrop-filter: blur(4px);
      z-index: 9999;
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #ebf3ff;
      border-top: 4px solid #006ce4;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .spinner-message {
      margin-top: 1rem;
      color: #0f2942;
      font-weight: 600;
      font-size: 0.95rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message = 'Loading...';
  @Input() overlay = false;
}
