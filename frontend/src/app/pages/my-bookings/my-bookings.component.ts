import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { BookingResponse } from '../../models/booking.model';
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
          <span class="header-tag">Manage Reservations</span>
          <h1 class="page-title">Retrieve Your Booking</h1>
          <p class="page-sub">Enter your unique booking reference and guest email address to view or cancel your stay.</p>
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
                  placeholder="e.g. THB-20261123-50A1E3"
                  class="form-control"
                  [class.is-invalid]="retrieveForm.get('reference')?.invalid && retrieveForm.get('reference')?.touched"
                />
                <div *ngIf="retrieveForm.get('reference')?.invalid && retrieveForm.get('reference')?.touched" class="field-error">
                  Booking reference is required.
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
                <span *ngIf="loading">Searching Database...</span>
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
              <span class="ref-sub">Booking Reference</span>
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
                <span class="room-name">Category: {{ booking.roomName }}</span>
              </div>
            </div>

            <div class="info-table">
              <div class="table-row">
                <span class="row-label">Guest Full Name:</span>
                <span class="row-val">{{ booking.guestName }}</span>
              </div>
              <div class="table-row">
                <span class="row-label">Email Address:</span>
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
                <span class="row-label">Number of Nights:</span>
                <span class="row-val">{{ booking.numberOfNights }}</span>
              </div>
              <div class="table-row">
                <span class="row-label">Rate Per Night:</span>
                <span class="row-val">₹{{ booking.pricePerNight | number:'1.0-0' }}</span>
              </div>
              <div class="table-row total-row">
                <span class="row-label">Total Booking Amount:</span>
                <span class="row-val total-price">₹{{ booking.totalAmount | number:'1.0-0' }}</span>
              </div>
            </div>

            <!-- CANCELLATION BUTTON & MODAL -->
            <div class="cancellation-action-area">
              <div *ngIf="booking.bookingStatus === 'CONFIRMED'">
                <p class="cancel-note">Need to cancel this reservation? Cancellation will immediately release the room capacity.</p>
                <button (click)="openCancelModal()" class="btn-cancel-booking">
                  Cancel This Booking
                </button>
              </div>

              <div *ngIf="booking.bookingStatus === 'CANCELLED'" class="cancelled-notice">
                <span class="icon">ℹ️</span>
                <span>This booking was cancelled. The reserved room has been released back into available inventory.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- CONFIRMATION MODAL -->
        <div *ngIf="showCancelModal" class="modal-backdrop">
          <div class="modal-dialog">
            <div class="modal-header">
              <h3 class="modal-title">Confirm Cancellation</h3>
              <button (click)="closeCancelModal()" class="btn-close">&times;</button>
            </div>
            <div class="modal-body">
              <div class="warning-icon">⚠️</div>
              <p>Are you sure you want to cancel booking <strong>{{ booking?.bookingReference }}</strong>?</p>
              <p class="modal-sub">This action cannot be undone. The reserved room will be instantly released for other guests.</p>
            </div>
            <div class="modal-footer">
              <button (click)="closeCancelModal()" [disabled]="cancelling" class="btn-modal-cancel">Keep Booking</button>
              <button (click)="confirmCancellation()" [disabled]="cancelling" class="btn-modal-confirm">
                <span *ngIf="!cancelling">Yes, Cancel Reservation</span>
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
    .text-center {
      text-align: center;
    }
    .header-tag {
      background: #ebf3ff;
      color: #006ce4;
      font-size: 0.82rem;
      font-weight: 700;
      padding: 0.35rem 0.85rem;
      border-radius: 20px;
      display: inline-block;
      margin-bottom: 0.6rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .page-title {
      font-size: 2.2rem;
      font-weight: 800;
      color: #0f2942;
      margin: 0 0 0.5rem;
      letter-spacing: -0.5px;
    }
    .page-sub {
      color: #64748b;
      margin: 0 0 2rem;
      font-size: 1rem;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 2rem;
      box-shadow: 0 4px 16px rgba(15, 41, 66, 0.06);
      margin-bottom: 2rem;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .form-group label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.4rem;
    }
    .required {
      color: #dc2626;
    }
    .form-control {
      width: 100%;
      padding: 0.75rem 0.9rem;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.95rem;
      box-sizing: border-box;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .form-control:focus {
      outline: none;
      border-color: #006ce4;
      box-shadow: 0 0 0 3px rgba(0, 108, 228, 0.15);
    }
    .form-control.is-invalid {
      border-color: #dc2626;
      background-color: #fffafb;
    }
    .field-error {
      color: #dc2626;
      font-size: 0.8rem;
      margin-top: 0.3rem;
      font-weight: 500;
    }
    .btn-retrieve {
      background: #006ce4;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 0.85rem 1.8rem;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-retrieve:hover:not(.disabled) {
      background: #0056b3;
    }
    .btn-retrieve.disabled {
      background: #94a3b8;
      cursor: not-allowed;
    }
    .error-banner {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 0.9rem 1.2rem;
      border-radius: 8px;
      margin-top: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.92rem;
    }
    .success-banner {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
      padding: 0.9rem 1.2rem;
      border-radius: 8px;
      margin-top: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.92rem;
      font-weight: 600;
    }
    .booking-details-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 6px 20px rgba(15, 41, 66, 0.08);
    }
    .details-header {
      background: #003580;
      color: #ffffff;
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .ref-sub {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #79b5ff;
    }
    .ref-heading {
      margin: 0.2rem 0 0;
      font-size: 1.6rem;
      font-family: monospace;
      letter-spacing: 1px;
    }
    .status-pill {
      padding: 0.35rem 0.85rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 700;
    }
    .status-pill.confirmed {
      background: #dcfce7;
      color: #15803d;
    }
    .status-pill.cancelled {
      background: #fee2e2;
      color: #b91c1c;
    }
    .details-body {
      padding: 2rem;
    }
    .hotel-summary-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .city-badge {
      font-size: 0.8rem;
      color: #006ce4;
      font-weight: 600;
    }
    .hotel-name {
      font-size: 1.3rem;
      font-weight: 700;
      color: #0f2942;
      margin: 0.25rem 0;
    }
    .room-name {
      font-size: 0.9rem;
      color: #64748b;
    }
    .info-table {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      margin-bottom: 2rem;
    }
    .table-row {
      display: flex;
      justify-content: space-between;
      padding-bottom: 0.6rem;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.95rem;
    }
    .row-label {
      color: #64748b;
    }
    .row-val {
      font-weight: 600;
      color: #0f2942;
    }
    .row-val.highlight {
      color: #006ce4;
    }
    .table-row.total-row {
      border-top: 1px solid #cbd5e1;
      padding-top: 0.8rem;
      margin-top: 0.5rem;
    }
    .total-price {
      font-size: 1.4rem;
      font-weight: 800;
      color: #003580;
    }
    .cancellation-action-area {
      background: #fff8f8;
      border: 1px dashed #fca5a5;
      padding: 1.5rem;
      border-radius: 10px;
      text-align: center;
    }
    .cancel-note {
      color: #7f1d1d;
      font-size: 0.9rem;
      margin: 0 0 1rem;
    }
    .btn-cancel-booking {
      background: #dc2626;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 0.75rem 1.5rem;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-cancel-booking:hover {
      background: #b91c1c;
    }
    .cancelled-notice {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      color: #991b1b;
      font-size: 0.92rem;
      font-weight: 600;
    }
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 41, 66, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 1.5rem;
    }
    .modal-dialog {
      background: #ffffff;
      border-radius: 14px;
      max-width: 480px;
      width: 100%;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
    }
    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-title {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 700;
      color: #0f2942;
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #94a3b8;
      cursor: pointer;
    }
    .modal-body {
      padding: 1.75rem;
      text-align: center;
    }
    .warning-icon {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
    }
    .modal-body p {
      margin: 0 0 0.5rem;
      font-size: 1rem;
      color: #0f2942;
    }
    .modal-sub {
      font-size: 0.88rem !important;
      color: #64748b !important;
    }
    .modal-footer {
      padding: 1.25rem 1.5rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 0.8rem;
    }
    .btn-modal-cancel {
      background: #e2e8f0;
      color: #334155;
      border: none;
      padding: 0.65rem 1.1rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-modal-confirm {
      background: #dc2626;
      color: #ffffff;
      border: none;
      padding: 0.65rem 1.2rem;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
    }
    @media (max-width: 600px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MyBookingsComponent implements OnInit {
  retrieveForm!: FormGroup;
  booking: BookingResponse | null = null;
  loading = false;
  errorMessage = '';
  cancelSuccessMessage = '';

  showCancelModal = false;
  cancelling = false;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.retrieveForm = this.fb.group({
      reference: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.route.queryParams.subscribe(params => {
      const ref = params['reference'];
      const email = params['email'];
      if (ref && email) {
        this.retrieveForm.patchValue({ reference: ref, email });
        this.onRetrieveBooking();
      }
    });
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

    const { reference, email } = this.retrieveForm.value;

    this.bookingService.getBooking(reference, email).subscribe({
      next: (res) => {
        this.booking = res;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'No booking found matching the provided reference and email address.';
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
    if (!this.booking) return;

    this.cancelling = true;
    this.errorMessage = '';
    this.cancelSuccessMessage = '';

    this.bookingService.cancelBooking(this.booking.bookingReference, this.booking.guestEmail).subscribe({
      next: (updatedBooking) => {
        this.cancelling = false;
        this.showCancelModal = false;
        this.booking = updatedBooking;
        this.cancelSuccessMessage = `Booking ${updatedBooking.bookingReference} has been successfully cancelled. Room availability has been released.`;
      },
      error: (err) => {
        this.cancelling = false;
        this.showCancelModal = false;
        this.errorMessage = err.error?.message || 'Failed to cancel booking.';
      }
    });
  }
}
