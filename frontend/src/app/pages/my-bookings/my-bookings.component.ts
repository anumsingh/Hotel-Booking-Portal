import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { BookingData } from '../../models/booking.model';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="my-bookings-page">
      <div class="page-container">
        <!-- HEADER -->
        <div class="page-header text-center">
          <span class="header-tag">🔒 256-Bit Encrypted Secure Lookup</span>
          <h1 class="page-title">Manage Your Reservations</h1>
          <p class="page-sub">Enter your unique booking reference and guest email address to review stay details or process an instant cancellation.</p>
        </div>

        <!-- SEARCH / RETRIEVE FORM CARD -->
        <div class="card retrieve-card">
          <form [formGroup]="retrieveForm" (ngSubmit)="onRetrieveBooking()" class="retrieve-form">
            <div class="form-grid">
              <div class="form-group">
                <label for="bookingRef">
                  Booking Reference Number <span class="required">*</span>
                </label>
                <input 
                  type="text" 
                  id="bookingRef" 
                  formControlName="reference" 
                  placeholder="e.g. THB-20261126-A1B2C3"
                  class="form-control"
                  [class.is-invalid]="retrieveForm.get('reference')?.invalid && retrieveForm.get('reference')?.touched"
                />
                <div *ngIf="retrieveForm.get('reference')?.invalid && retrieveForm.get('reference')?.touched" class="field-error">
                  <span *ngIf="retrieveForm.get('reference')?.errors?.['required']">Booking reference is required.</span>
                  <span *ngIf="retrieveForm.get('reference')?.errors?.['pattern']">Expected format: THB-YYYYMMDD-XXXXXX.</span>
                </div>
              </div>

              <div class="form-group">
                <label for="guestEmail">
                  Guest Email Address <span class="required">*</span>
                </label>
                <input 
                  type="email" 
                  id="guestEmail" 
                  formControlName="email" 
                  placeholder="e.g. guest@example.com"
                  class="form-control"
                  [class.is-invalid]="retrieveForm.get('email')?.invalid && retrieveForm.get('email')?.touched"
                />
                <div *ngIf="retrieveForm.get('email')?.invalid && retrieveForm.get('email')?.touched" class="field-error">
                  A valid email address is required.
                </div>
              </div>
            </div>

            <div class="form-footer">
              <button 
                type="submit" 
                [disabled]="retrieveForm.invalid || loading" 
                class="btn-retrieve"
                [class.disabled]="retrieveForm.invalid || loading">
                <span *ngIf="!loading">Retrieve Booking</span>
                <span *ngIf="loading">Verifying with Server...</span>
              </button>
            </div>
          </form>

          <!-- Error Alert -->
          <div *ngIf="errorMessage" class="error-banner">
            <span class="icon">⚠️</span>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Cancellation Success Alert -->
          <div *ngIf="cancelSuccessMessage" class="success-banner">
            <span class="icon">✓</span>
            <span>{{ cancelSuccessMessage }}</span>
          </div>
        </div>

        <!-- DISPLAYED BOOKING DETAILS CARD -->
        <div *ngIf="booking" class="booking-details-card">
          <div class="details-header">
            <div>
              <span class="ref-sub">Verified Reservation</span>
              <h2 class="ref-heading">{{ booking.bookingReference }}</h2>
            </div>
            <div class="status-pill" [class.confirmed]="booking.bookingStatus === 'CONFIRMED'" [class.cancelled]="booking.bookingStatus === 'CANCELLED'">
              ● {{ booking.bookingStatus }}
            </div>
          </div>

          <div class="details-body">
            <div class="hotel-summary-box">
              <div class="hotel-info">
                <span class="city-badge">📍 {{ booking.hotelLocation }}</span>
                <h3 class="hotel-name">{{ booking.hotelName }}</h3>
                <span class="room-name">Reserved Suite: {{ booking.roomName }}</span>
              </div>
            </div>

            <div class="info-table">
              <div class="table-row">
                <span class="row-label">Guest Full Name:</span>
                <span class="row-val">{{ booking.guestName }}</span>
              </div>
              <div class="table-row">
                <span class="row-label">Registered Email:</span>
                <span class="row-val">{{ booking.guestEmail }}</span>
              </div>
              <div class="table-row">
                <span class="row-label">Check-in Date:</span>
                <span class="row-val highlight">{{ booking.checkInDate }}</span>
              </div>
              <div class="table-row">
                <span class="row-label">Check-out Date:</span>
                <span class="row-val highlight">{{ booking.checkOutDate }}</span>
              </div>
              <div class="table-row">
                <span class="row-label">Duration of Stay:</span>
                <span class="row-val">{{ booking.numberOfNights }} Night{{ booking.numberOfNights > 1 ? 's' : '' }}</span>
              </div>
              <div class="table-row">
                <span class="row-label">Nightly Room Rate:</span>
                <span class="row-val">₹{{ booking.pricePerNight | number:'1.0-0' }}</span>
              </div>
              <div class="table-row total-row">
                <span class="row-label">Total Booking Amount:</span>
                <span class="row-val total-price">₹{{ booking.totalAmount | number:'1.0-0' }}</span>
              </div>
            </div>

            <!-- Cancellation Section (Only if status is CONFIRMED) -->
            <div *ngIf="booking.bookingStatus === 'CONFIRMED'" class="cancellation-action-area">
              <p class="cancel-note">Need to alter your plans? Cancellations are instant and immediately release room inventory.</p>
              <button (click)="openCancelModal()" class="btn-cancel-booking">
                Cancel This Reservation
              </button>
            </div>

            <!-- Cancelled Notice (If status is CANCELLED) -->
            <div *ngIf="booking.bookingStatus === 'CANCELLED'" class="cancelled-notice">
              <span>⚠️ This reservation has been cancelled and room inventory has been released.</span>
            </div>
          </div>
        </div>

        <!-- CANCEL CONFIRMATION MODAL -->
        <div *ngIf="showCancelModal" class="modal-backdrop">
          <div class="modal-dialog">
            <div class="modal-header">
              <h3 class="modal-title">Confirm Cancellation</h3>
              <button (click)="closeCancelModal()" class="btn-close" aria-label="Close modal">&times;</button>
            </div>
            <div class="modal-body">
              <div class="warning-icon">⚠️</div>
              <p>Are you sure you want to cancel booking <strong>{{ booking?.bookingReference }}</strong>?</p>
              <p class="modal-sub">This action cannot be undone and your room reservation at {{ booking?.hotelName }} will be cancelled.</p>
            </div>
            <div class="modal-footer">
              <button (click)="closeCancelModal()" class="btn-modal-cancel" [disabled]="cancelling">Keep Booking</button>
              <button (click)="confirmCancellation()" class="btn-modal-confirm" [disabled]="cancelling">
                <span *ngIf="!cancelling">Confirm Cancellation</span>
                <span *ngIf="cancelling">Cancelling...</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-bookings-page {
      background-color: #f8fafc;
      min-height: calc(100vh - 70px);
      padding: 3rem 1.5rem 5rem;
    }
    .page-container {
      max-width: 820px;
      margin: 0 auto;
    }
    .page-header {
      margin-bottom: 2.25rem;
    }
    .text-center {
      text-align: center;
    }
    .header-tag {
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 0.35rem 0.95rem;
      border-radius: 9999px;
      display: inline-block;
      margin-bottom: 0.75rem;
      letter-spacing: 0.04em;
    }
    .page-title {
      font-size: 2.3rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.5rem;
      letter-spacing: -0.025em;
    }
    .page-sub {
      color: #64748b;
      margin: 0;
      font-size: 1rem;
      line-height: 1.6;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 2.25rem;
      box-shadow: 0 4px 20px rgba(10, 17, 40, 0.05);
      margin-bottom: 2.25rem;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.4rem;
      margin-bottom: 1.6rem;
    }
    .form-group label {
      display: block;
      font-size: 0.84rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.45rem;
    }
    .required {
      color: #dc2626;
    }
    .form-control {
      width: 100%;
      padding: 0.82rem 1rem;
      border: 1.5px solid #cbd5e1;
      border-radius: 10px;
      font-size: 0.95rem;
      background: #f8fafc;
      box-sizing: border-box;
      font-family: inherit;
      transition: all 0.2s ease;
    }
    .form-control:focus {
      outline: none;
      background: #ffffff;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }
    .form-control.is-invalid {
      border-color: #dc2626;
      background-color: #fffafb;
    }
    .field-error {
      color: #dc2626;
      font-size: 0.82rem;
      margin-top: 0.35rem;
      font-weight: 600;
    }
    .btn-retrieve {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      border: none;
      border-radius: 10px;
      padding: 0.9rem 2rem;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
      transition: all 0.25s ease;
    }
    .btn-retrieve:hover:not(.disabled) {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
      transform: translateY(-1px);
    }
    .btn-retrieve.disabled {
      background: #94a3b8;
      box-shadow: none;
      cursor: not-allowed;
    }
    .error-banner {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 1rem 1.25rem;
      border-radius: 10px;
      margin-top: 1.35rem;
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-size: 0.92rem;
      font-weight: 600;
    }
    .success-banner {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
      padding: 1rem 1.25rem;
      border-radius: 10px;
      margin-top: 1.35rem;
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-size: 0.92rem;
      font-weight: 600;
    }
    .booking-details-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(10, 17, 40, 0.08);
    }
    .details-header {
      background: linear-gradient(135deg, #060c1d 0%, #0a1128 50%, #12234f 100%);
      color: #ffffff;
      padding: 1.75rem 2.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .ref-sub {
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #93c5fd;
      font-weight: 600;
    }
    .ref-heading {
      margin: 0.25rem 0 0;
      font-size: 1.65rem;
      font-family: monospace;
      letter-spacing: 1px;
    }
    .status-pill {
      padding: 0.4rem 0.95rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 700;
    }
    .status-pill.confirmed {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    .status-pill.cancelled {
      background: #fff1f2;
      color: #b91c1c;
      border: 1px solid #fecdd3;
    }
    .details-body {
      padding: 2.25rem;
    }
    .hotel-summary-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.35rem;
      margin-bottom: 1.6rem;
    }
    .city-badge {
      font-size: 0.78rem;
      color: #1d4ed8;
      font-weight: 700;
    }
    .hotel-name {
      font-size: 1.35rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0.3rem 0;
    }
    .room-name {
      font-size: 0.92rem;
      color: #64748b;
      font-weight: 500;
    }
    .info-table {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      margin-bottom: 2.25rem;
    }
    .table-row {
      display: flex;
      justify-content: space-between;
      padding-bottom: 0.7rem;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.95rem;
    }
    .row-label {
      color: #64748b;
    }
    .row-val {
      font-weight: 600;
      color: #0f172a;
    }
    .row-val.highlight {
      color: #2563eb;
      font-weight: 700;
    }
    .table-row.total-row {
      border-top: 1px solid #cbd5e1;
      padding-top: 0.9rem;
      margin-top: 0.6rem;
    }
    .total-price {
      font-size: 1.45rem;
      font-weight: 800;
      color: #1d4ed8;
    }
    .cancellation-action-area {
      background: #fff8f8;
      border: 1.5px dashed #fca5a5;
      padding: 1.6rem;
      border-radius: 12px;
      text-align: center;
    }
    .cancel-note {
      color: #7f1d1d;
      font-size: 0.92rem;
      margin: 0 0 1.1rem;
      line-height: 1.5;
    }
    .btn-cancel-booking {
      background: #dc2626;
      color: #ffffff;
      border: none;
      border-radius: 10px;
      padding: 0.8rem 1.6rem;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
      transition: all 0.2s ease;
    }
    .btn-cancel-booking:hover {
      background: #b91c1c;
      transform: translateY(-1px);
    }
    .cancelled-notice {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      color: #991b1b;
      font-size: 0.94rem;
      font-weight: 600;
      background: #fff1f2;
      border: 1px solid #fecdd3;
      padding: 1rem;
      border-radius: 10px;
    }
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(6, 12, 29, 0.65);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 1.5rem;
    }
    .modal-dialog {
      background: #ffffff;
      border-radius: 18px;
      max-width: 490px;
      width: 100%;
      overflow: hidden;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.3);
    }
    .modal-header {
      padding: 1.35rem 1.6rem;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 1.6rem;
      color: #94a3b8;
      cursor: pointer;
    }
    .modal-body {
      padding: 1.85rem;
      text-align: center;
    }
    .warning-icon {
      font-size: 2.8rem;
      margin-bottom: 0.85rem;
    }
    .modal-body p {
      margin: 0 0 0.5rem;
      font-size: 1.02rem;
      color: #0f172a;
    }
    .modal-sub {
      font-size: 0.88rem !important;
      color: #64748b !important;
      line-height: 1.5;
    }
    .modal-footer {
      padding: 1.35rem 1.6rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 0.85rem;
    }
    .btn-modal-cancel {
      background: #e2e8f0;
      color: #334155;
      border: none;
      padding: 0.7rem 1.2rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-modal-confirm {
      background: #dc2626;
      color: #ffffff;
      border: none;
      padding: 0.7rem 1.35rem;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
    }
    @media (max-width: 600px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MyBookingsComponent implements OnInit, OnDestroy {
  retrieveForm!: FormGroup;
  booking: BookingData | null = null;
  verificationToken: string | null = null;
  loading = false;
  errorMessage = '';
  cancelSuccessMessage = '';

  showCancelModal = false;
  cancelling = false;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    // Collect credentials via Angular Reactive Form only
    // Eliminates all URL parameters, query parameters, and browser history leakage
    this.retrieveForm = this.fb.group({
      reference: ['', [Validators.required, Validators.pattern(/^THB-\d{8}-[A-F0-9]{6}$/)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnDestroy(): void {
    // Avoid retaining sensitive booking tokens and credentials in application memory
    this.verificationToken = null;
    this.booking = null;
    if (this.retrieveForm) {
      this.retrieveForm.reset();
    }
  }

  onRetrieveBooking(): void {
    if (this.retrieveForm.invalid) {
      this.retrieveForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.cancelSuccessMessage = '';
    this.booking = null;
    this.verificationToken = null;

    const { reference, email } = this.retrieveForm.value;

    // Secure POST retrieval: credentials sent encrypted in request body, not exposed in URL
    this.bookingService.lookupBooking({
      bookingReference: reference.trim().toUpperCase(),
      email: email.trim().toLowerCase()
    }).subscribe({
      next: (res) => {
        this.booking = res.data;
        this.verificationToken = res.verificationToken;
        this.loading = false;
        // Clear sensitive input fields after successful processing to prevent screen peeking/caching
        this.retrieveForm.reset();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Unable to retrieve booking with the provided details.';
        this.loading = false;
      }
    });
  }

  openCancelModal(): void {
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
  }

  confirmCancellation(): void {
    if (!this.booking || !this.verificationToken) {
      this.errorMessage = 'Active verification session missing. Please look up your reservation again.';
      this.showCancelModal = false;
      return;
    }

    this.cancelling = true;
    this.errorMessage = '';
    this.cancelSuccessMessage = '';

    // Cancellation requires short-lived server-side verification session token
    this.bookingService.secureCancelBooking({
      bookingReference: this.booking.bookingReference,
      email: this.booking.guestEmail,
      verificationToken: this.verificationToken
    }).subscribe({
      next: (updatedBooking) => {
        this.cancelling = false;
        this.showCancelModal = false;
        this.booking = updatedBooking;
        // Invalidate in-memory token once used
        this.verificationToken = null;
        this.cancelSuccessMessage = `Booking ${updatedBooking.bookingReference} has been successfully cancelled. Reserved room capacity has been released.`;
      },
      error: (err) => {
        this.cancelling = false;
        this.showCancelModal = false;
        this.errorMessage = err.error?.message || 'Failed to cancel booking. Verification session may have expired.';
      }
    });
  }
}
