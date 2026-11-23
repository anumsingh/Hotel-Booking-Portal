import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BookingService } from '../../services/booking.service';
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
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h1 class="success-title">Your booking has been confirmed!</h1>
            <p class="success-sub">Thank you for booking with us. A confirmation has been stored in MySQL database.</p>
          </div>

          <!-- BOOKING REFERENCE BADGE -->
          <div class="reference-banner">
            <div class="reference-info">
              <span class="ref-label">Booking Reference Number</span>
              <strong class="ref-code">{{ booking.bookingReference }}</strong>
            </div>
            <div class="status-badge" [class.confirmed]="booking.bookingStatus === 'CONFIRMED'">
              ● {{ booking.bookingStatus }}
            </div>
          </div>

          <!-- SUMMARY GRID -->
          <div class="details-section">
            <h3 class="section-title">Reservation Details</h3>

            <div class="info-grid">
              <div class="info-group">
                <span class="label">Guest Full Name</span>
                <span class="val">{{ booking.guestName }}</span>
              </div>

              <div class="info-group">
                <span class="label">Guest Email</span>
                <span class="val">{{ booking.guestEmail }}</span>
              </div>

              <div class="info-group">
                <span class="label">Hotel Name</span>
                <span class="val">{{ booking.hotelName }}</span>
              </div>

              <div class="info-group">
                <span class="label">Location</span>
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
                <span class="label">Total Amount Paid / Due</span>
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
              Download / Print Confirmation
            </button>

            <a [routerLink]="['/my-bookings']" [queryParams]="{reference: booking.bookingReference, email: booking.guestEmail}" class="btn-action btn-retrieve">
              View Booking Details
            </a>

            <a routerLink="/" class="btn-action btn-home-link">
              Go to Home
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
      max-width: 800px;
      margin: 0 auto;
    }
    .confirmation-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(15, 41, 66, 0.08);
    }
    .success-banner {
      background: linear-gradient(135deg, #003580 0%, #006ce4 100%);
      color: #ffffff;
      padding: 2.5rem 2rem;
      text-align: center;
    }
    .success-icon-wrap {
      width: 70px;
      height: 70px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      margin: 0 auto 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(255, 255, 255, 0.4);
    }
    .success-title {
      font-size: 2rem;
      font-weight: 800;
      margin: 0 0 0.5rem;
    }
    .success-sub {
      color: #ebf3ff;
      margin: 0;
      font-size: 1rem;
    }
    .reference-banner {
      background: #ebf3ff;
      border-bottom: 1px solid #cbd5e1;
      padding: 1.25rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .ref-label {
      display: block;
      font-size: 0.78rem;
      text-transform: uppercase;
      font-weight: 700;
      color: #006ce4;
      letter-spacing: 0.5px;
    }
    .ref-code {
      font-size: 1.4rem;
      color: #003580;
      font-family: monospace;
      letter-spacing: 1px;
    }
    .status-badge {
      padding: 0.35rem 0.85rem;
      border-radius: 20px;
      font-weight: 700;
      font-size: 0.85rem;
    }
    .status-badge.confirmed {
      background: #dcfce7;
      color: #15803d;
    }
    .details-section {
      padding: 2rem;
    }
    .section-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: #0f2942;
      margin: 0 0 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #f1f5f9;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
    .info-group {
      display: flex;
      flex-direction: column;
    }
    .info-group .label {
      font-size: 0.8rem;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    .info-group .val {
      font-size: 1.05rem;
      font-weight: 600;
      color: #0f2942;
    }
    .check-date {
      color: #006ce4 !important;
    }
    .total-group {
      grid-column: span 2;
      border-top: 1px solid #e2e8f0;
      padding-top: 1rem;
      margin-top: 0.5rem;
    }
    .total-val {
      font-size: 1.6rem !important;
      font-weight: 800 !important;
      color: #003580 !important;
    }
    .actions-bar {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 1.5rem 2rem;
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .btn-action {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.95rem;
      text-decoration: none;
      cursor: pointer;
      border: none;
    }
    .btn-print {
      background: #006ce4;
      color: #ffffff;
    }
    .btn-print:hover {
      background: #0056b3;
    }
    .btn-retrieve {
      background: #ebf3ff;
      color: #006ce4;
    }
    .btn-retrieve:hover {
      background: #d5e8ff;
    }
    .btn-home-link {
      background: #f1f5f9;
      color: #475569;
      margin-left: auto;
    }
    .btn-home-link:hover {
      background: #e2e8f0;
      color: #0f2942;
    }
    .error-card {
      background: #ffffff;
      padding: 3rem;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 14px rgba(0,0,0,0.06);
    }
    .btn-home {
      display: inline-block;
      margin-top: 1rem;
      background: #006ce4;
      color: #ffffff;
      padding: 0.6rem 1.2rem;
      border-radius: 6px;
      text-decoration: none;
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
    @media (max-width: 600px) {
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
    private route: ActivatedRoute,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const reference = params['reference'];
      this.route.queryParams.subscribe(qParams => {
        const email = qParams['email'];
        if (reference && email) {
          this.fetchBooking(reference, email);
        } else {
          this.errorMessage = 'Booking reference or guest email missing from confirmation request.';
          this.loading = false;
        }
      });
    });
  }

  fetchBooking(reference: string, email: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.bookingService.getBooking(reference, email).subscribe({
      next: (data) => {
        this.booking = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Unable to retrieve confirmed booking record.';
        this.loading = false;
      }
    });
  }

  printConfirmation(): void {
    window.print();
  }
}
