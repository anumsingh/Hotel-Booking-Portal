import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BookingResponse } from '../../models/booking.model';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="confirmation-page">
      <div class="confirmation-container">
        <!-- Loading State -->
        <app-loading-spinner *ngIf="loading" message="Loading confirmed booking details..."></app-loading-spinner>

        <!-- Error State -->
        <div *ngIf="errorMessage && !loading" class="error-card">
          <h2>Booking Confirmation Error</h2>
          <p>{{ errorMessage }}</p>
          <a routerLink="/" class="btn-home">Return to Home</a>
        </div>

        <!-- Confirmed Card -->
        <div *ngIf="booking && !loading" class="confirmation-card print-area">
          <!-- SUCCESS HEADER -->
          <div class="success-banner">
            <div class="success-icon-wrap">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h1 class="success-title">Your Reservation is Confirmed!</h1>
            <p class="success-sub">Thank you for reserving with us. Your room inventory is locked and verified in our database.</p>
          </div>

          <!-- BOOKING REFERENCE BADGE -->
          <div class="reference-banner">
            <div class="reference-info">
              <span class="ref-label">Official Booking Reference</span>
              <strong class="ref-code">{{ booking.bookingReference }}</strong>
            </div>
            <div class="status-badge" [class.confirmed]="booking.bookingStatus === 'CONFIRMED'">
              ● {{ booking.bookingStatus }}
            </div>
          </div>

          <!-- SUMMARY GRID -->
          <div class="details-section">
            <h3 class="section-title">Reservation Voucher Details</h3>

            <div class="info-grid">
              <div class="info-group">
                <span class="label">Guest Full Name</span>
                <span class="val">{{ booking.guestName }}</span>
              </div>

              <div class="info-group">
                <span class="label">Registered Email</span>
                <span class="val">{{ booking.guestEmail }}</span>
              </div>

              <div class="info-group">
                <span class="label">Property Name</span>
                <span class="val hotel-name-highlight">{{ booking.hotelName }}</span>
              </div>

              <div class="info-group">
                <span class="label">Destination</span>
                <span class="val">📍 {{ booking.hotelLocation }}</span>
              </div>

              <div class="info-group">
                <span class="label">Room Category</span>
                <span class="val">{{ booking.roomName }}</span>
              </div>

              <div class="info-group">
                <span class="label">Duration of Stay</span>
                <span class="val">{{ booking.numberOfNights }} Night{{ booking.numberOfNights > 1 ? 's' : '' }}</span>
              </div>

              <div class="info-group">
                <span class="label">Check-in Date</span>
                <span class="val check-date">{{ booking.checkInDate }}</span>
              </div>

              <div class="info-group">
                <span class="label">Check-out Date</span>
                <span class="val check-date">{{ booking.checkOutDate }}</span>
              </div>

              <div class="info-group">
                <span class="label">Price per Night</span>
                <span class="val">₹{{ booking.pricePerNight | number:'1.0-0' }}</span>
              </div>

              <div class="info-group total-group">
                <span class="label">Total Amount Verified &amp; Paid</span>
                <span class="val total-val">₹{{ booking.totalAmount | number:'1.0-0' }}</span>
              </div>
            </div>
          </div>

          <!-- ACTIONS BAR (Hidden when printing) -->
          <div class="actions-bar no-print">
            <button (click)="printConfirmation()" class="btn-action btn-print">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Print / Save Voucher
            </button>

            <a routerLink="/my-bookings" class="btn-action btn-retrieve">
              Manage in My Bookings
            </a>

            <a routerLink="/" class="btn-action btn-home-link">
              Explore More Hotels
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-page {
      background-color: #f8fafc;
      min-height: calc(100vh - 70px);
      padding: 3rem 1.5rem 5rem;
    }
    .confirmation-container {
      max-width: 820px;
      margin: 0 auto;
    }
    .confirmation-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 12px 36px rgba(10, 17, 40, 0.08);
    }
    .success-banner {
      background: linear-gradient(135deg, #060c1d 0%, #0a1128 50%, #12234f 100%);
      color: #ffffff;
      padding: 2.75rem 2rem;
      text-align: center;
      position: relative;
    }
    .success-icon-wrap {
      width: 68px;
      height: 68px;
      background: rgba(16, 185, 129, 0.2);
      border: 2px solid #10b981;
      color: #10b981;
      border-radius: 50%;
      margin: 0 auto 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.35);
    }
    .success-title {
      font-size: 2.1rem;
      font-weight: 800;
      margin: 0 0 0.5rem;
      letter-spacing: -0.025em;
    }
    .success-sub {
      color: #cbd5e1;
      margin: 0;
      font-size: 1rem;
      max-width: 580px;
      margin: 0 auto;
      line-height: 1.55;
    }
    .reference-banner {
      background: #f8fafc;
      border-bottom: 1px dashed #cbd5e1;
      padding: 1.35rem 2.2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .ref-label {
      display: block;
      font-size: 0.76rem;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.06em;
    }
    .ref-code {
      font-size: 1.45rem;
      color: #1d4ed8;
      font-family: monospace;
      letter-spacing: 1px;
    }
    .status-badge {
      padding: 0.35rem 0.9rem;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 0.84rem;
    }
    .status-badge.confirmed {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    .details-section {
      padding: 2.2rem;
    }
    .section-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 1.5rem;
      padding-bottom: 0.65rem;
      border-bottom: 1px solid #f1f5f9;
      letter-spacing: -0.01em;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.6rem;
    }
    .info-group {
      display: flex;
      flex-direction: column;
    }
    .info-group .label {
      font-size: 0.78rem;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
      letter-spacing: 0.04em;
      margin-bottom: 0.25rem;
    }
    .info-group .val {
      font-size: 1.05rem;
      font-weight: 600;
      color: #0f172a;
    }
    .hotel-name-highlight {
      color: #1d4ed8 !important;
      font-weight: 700 !important;
    }
    .check-date {
      color: #2563eb !important;
      font-weight: 700 !important;
    }
    .total-group {
      grid-column: span 2;
      border-top: 1px solid #e2e8f0;
      padding-top: 1.15rem;
      margin-top: 0.5rem;
    }
    .total-val {
      font-size: 1.65rem !important;
      font-weight: 800 !important;
      color: #1d4ed8 !important;
    }
    .actions-bar {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 1.5rem 2.2rem;
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: center;
    }
    .btn-action {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.35rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.92rem;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }
    .btn-print {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
    }
    .btn-print:hover {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
      transform: translateY(-1px);
    }
    .btn-retrieve {
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
    }
    .btn-retrieve:hover {
      background: #dbeafe;
    }
    .btn-home-link {
      background: #f1f5f9;
      color: #475569;
      margin-left: auto;
    }
    .btn-home-link:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
    .error-card {
      background: #ffffff;
      padding: 3.5rem 2rem;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(10, 17, 40, 0.06);
      border: 1px solid #e2e8f0;
    }
    .btn-home {
      display: inline-block;
      margin-top: 1.25rem;
      background: #2563eb;
      color: #ffffff;
      padding: 0.65rem 1.35rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
    }
    @media print {
      .no-print {
        display: none !important;
      }
      .confirmation-card {
        box-shadow: none;
        border: none;
      }
      .confirmation-page {
        padding: 0;
        background: #ffffff;
      }
    }
    @media (max-width: 650px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
      .total-group {
        grid-column: span 1;
      }
      .btn-home-link {
        margin-left: 0;
      }
    }
  `]
})
export class BookingConfirmationComponent implements OnInit {
  booking: BookingResponse | null = null;
  loading = true;
  errorMessage = '';

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    // Read booking strictly from in-memory Router navigation state
    // Prevents sensitive booking reference and guest email exposure in URLs, browser history, or logs
    const state = history.state;
    if (state && state.booking) {
      this.booking = state.booking;
      this.loading = false;
    } else {
      this.loading = false;
      this.errorMessage = 'No active booking found in memory. Please enter your reference in My Bookings to retrieve your details.';
    }
  }

  printConfirmation(): void {
    window.print();
  }
}
