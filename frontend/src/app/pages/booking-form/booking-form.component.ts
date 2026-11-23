import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HotelService } from '../../services/hotel.service';
import { BookingService } from '../../services/booking.service';
import { Hotel } from '../../models/hotel.model';
import { EstimateResponse } from '../../models/estimate.model';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="booking-page">
      <div class="booking-container">
        <!-- BREADCRUMB -->
        <nav class="breadcrumb">
          <a routerLink="/">Home</a> &gt;
          <a [routerLink]="['/hotels', hotelId]">Hotel Details</a> &gt;
          <span>Complete Booking</span>
        </nav>

        <h1 class="page-title">Secure Hotel Booking</h1>
        <p class="page-sub">Review your stay details and provide guest information to confirm your reservation.</p>

        <!-- Loading Estimate / Hotel -->
        <app-loading-spinner *ngIf="loadingData" message="Loading booking details from server..."></app-loading-spinner>

        <!-- Error loading -->
        <div *ngIf="loadError && !loadingData" class="error-banner">
          <p>{{ loadError }}</p>
          <a routerLink="/hotels" class="btn-return">Return to Hotel Selection</a>
        </div>

        <div *ngIf="!loadingData && !loadError && hotel && estimate" class="booking-grid">
          <!-- LEFT: GUEST DETAILS FORM -->
          <div class="form-column">
            <div class="card form-card">
              <div class="card-header">
                <span class="step-badge">Step 1</span>
                <h2>Guest Information</h2>
              </div>
              <p class="form-intro">Your confirmation and booking reference will be sent to this email address.</p>

              <form [formGroup]="guestForm" (ngSubmit)="onSubmitBooking()" class="guest-form">
                <div class="form-group">
                  <label for="guestName">
                    Full Name <span class="required">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="guestName" 
                    formControlName="guestName" 
                    placeholder="e.g. Rajesh Sharma"
                    class="form-control"
                    [class.is-invalid]="guestForm.get('guestName')?.invalid && guestForm.get('guestName')?.touched"
                  />
                  <div *ngIf="guestForm.get('guestName')?.invalid && guestForm.get('guestName')?.touched" class="field-error">
                    <span *ngIf="guestForm.get('guestName')?.errors?.['required']">Full name is required.</span>
                    <span *ngIf="guestForm.get('guestName')?.errors?.['minlength']">Name must be at least 2 characters.</span>
                    <span *ngIf="guestForm.get('guestName')?.errors?.['maxlength']">Name cannot exceed 100 characters.</span>
                  </div>
                </div>

                <div class="form-group">
                  <label for="guestEmail">
                    Email Address <span class="required">*</span>
                  </label>
                  <input 
                    type="email" 
                    id="guestEmail" 
                    formControlName="guestEmail" 
                    placeholder="e.g. rajesh.sharma@example.com"
                    class="form-control"
                    [class.is-invalid]="guestForm.get('guestEmail')?.invalid && guestForm.get('guestEmail')?.touched"
                  />
                  <div *ngIf="guestForm.get('guestEmail')?.invalid && guestForm.get('guestEmail')?.touched" class="field-error">
                    <span *ngIf="guestForm.get('guestEmail')?.errors?.['required']">Email address is required.</span>
                    <span *ngIf="guestForm.get('guestEmail')?.errors?.['email']">Please enter a valid email format.</span>
                  </div>
                </div>

                <!-- Backend API Submission Error -->
                <div *ngIf="submitError" class="submission-error">
                  <span class="error-icon">⚠️</span>
                  <span>{{ submitError }}</span>
                </div>

                <div class="form-actions">
                  <button 
                    type="submit" 
                    [disabled]="guestForm.invalid || submitting || !estimate.isAvailable" 
                    class="btn-confirm"
                    [class.disabled]="guestForm.invalid || submitting || !estimate.isAvailable">
                    <span *ngIf="!submitting">Confirm Booking</span>
                    <span *ngIf="submitting">Processing Reservation...</span>
                  </button>
                  <a [routerLink]="['/hotels', hotel.id]" class="btn-cancel-link">Back to Hotel</a>
                </div>

                <div class="trust-notice">
                  <span>🔒 256-Bit SSL Encrypted | Direct MySQL Database Confirmation</span>
                </div>
              </form>
            </div>
          </div>

          <!-- RIGHT: RESERVATION SUMMARY -->
          <div class="summary-column">
            <div class="card summary-card">
              <div class="summary-hotel-header">
                <img [src]="hotel.imageUrl" [alt]="hotel.name" class="summary-img">
                <div class="summary-hotel-info">
                  <span class="city-badge">📍 {{ hotel.location }}</span>
                  <h3 class="hotel-title">{{ hotel.name }}</h3>
                  <span class="room-title">{{ hotel.roomType?.roomName }}</span>
                </div>
              </div>

              <div class="stay-details">
                <h4 class="details-heading">Stay Breakdown</h4>

                <div class="detail-row">
                  <span class="label">Check-in</span>
                  <span class="val">{{ estimate.checkInDate }}</span>
                </div>

                <div class="detail-row">
                  <span class="label">Check-out</span>
                  <span class="val">{{ estimate.checkOutDate }}</span>
                </div>

                <div class="detail-row">
                  <span class="label">Duration</span>
                  <span class="val">{{ estimate.numberOfNights }} Night{{ estimate.numberOfNights > 1 ? 's' : '' }}</span>
                </div>

                <div class="detail-row">
                  <span class="label">Nightly Rate</span>
                  <span class="val">₹{{ estimate.pricePerNight | number:'1.0-0' }}</span>
                </div>

                <div class="detail-row">
                  <span class="label">Room Capacity</span>
                  <span class="val">{{ hotel.roomType?.totalRooms }} Rooms Total</span>
                </div>

                <div class="detail-row avail-row">
                  <span class="label">Current Availability</span>
                  <span class="val avail-tag" [class.sold-out]="!estimate.isAvailable">
                    {{ estimate.isAvailable ? estimate.availableRooms + ' Rooms Free' : 'Sold Out' }}
                  </span>
                </div>

                <!-- Price Breakdown Section -->
                <div class="price-breakdown">
                  <div class="price-row">
                    <span>Room Charges ({{ estimate.numberOfNights }} x ₹{{ estimate.pricePerNight | number:'1.0-0' }})</span>
                    <span>₹{{ estimate.totalAmount | number:'1.0-0' }}</span>
                  </div>
                  <div class="price-row">
                    <span>Taxes &amp; Fees</span>
                    <span>₹0 (Included)</span>
                  </div>
                  <div class="price-row total-row">
                    <span class="total-label">Total Amount Due</span>
                    <span class="total-val">₹{{ estimate.totalAmount | number:'1.0-0' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .booking-page {
      background-color: #f8fafc;
      min-height: calc(100vh - 70px);
      padding: 2rem 1.5rem 5rem;
    }
    .booking-container {
      max-width: 1100px;
      margin: 0 auto;
    }
    .breadcrumb {
      font-size: 0.88rem;
      color: #64748b;
      margin-bottom: 1rem;
    }
    .breadcrumb a {
      color: #006ce4;
      text-decoration: none;
    }
    .page-title {
      font-size: 2rem;
      font-weight: 800;
      color: #0f2942;
      margin: 0 0 0.4rem;
    }
    .page-sub {
      color: #64748b;
      margin: 0 0 2rem;
      font-size: 0.98rem;
    }
    .booking-grid {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 2rem;
      align-items: flex-start;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.75rem;
      box-shadow: 0 4px 14px rgba(15, 41, 66, 0.05);
    }
    .card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }
    .card-header h2 {
      margin: 0;
      font-size: 1.4rem;
      font-weight: 700;
      color: #0f2942;
    }
    .step-badge {
      background: #006ce4;
      color: #ffffff;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
    }
    .form-intro {
      color: #64748b;
      font-size: 0.9rem;
      margin: 0 0 1.5rem;
    }
    .guest-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .form-group label {
      display: block;
      font-size: 0.88rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.4rem;
    }
    .required {
      color: #dc2626;
    }
    .form-control {
      width: 100%;
      padding: 0.8rem 0.95rem;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.95rem;
      color: #0f2942;
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
      font-size: 0.82rem;
      margin-top: 0.35rem;
      font-weight: 500;
    }
    .submission-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 0.9rem;
      border-radius: 8px;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .form-actions {
      display: flex;
      align-items: center;
      gap: 1.2rem;
      margin-top: 0.5rem;
    }
    .btn-confirm {
      background: #006ce4;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 0.9rem 1.8rem;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s, transform 0.15s;
    }
    .btn-confirm:hover:not(.disabled) {
      background: #0056b3;
      transform: translateY(-1px);
    }
    .btn-confirm.disabled {
      background: #94a3b8;
      cursor: not-allowed;
    }
    .btn-cancel-link {
      color: #64748b;
      text-decoration: none;
      font-size: 0.92rem;
      font-weight: 600;
    }
    .btn-cancel-link:hover {
      color: #0f2942;
    }
    .trust-notice {
      font-size: 0.78rem;
      color: #64748b;
      margin-top: 0.5rem;
    }
    .summary-hotel-header {
      display: flex;
      gap: 1rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 1.25rem;
    }
    .summary-img {
      width: 90px;
      height: 90px;
      border-radius: 8px;
      object-fit: cover;
    }
    .summary-hotel-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .city-badge {
      font-size: 0.75rem;
      color: #006ce4;
      font-weight: 600;
    }
    .hotel-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f2942;
      margin: 0.2rem 0;
    }
    .room-title {
      font-size: 0.85rem;
      color: #64748b;
    }
    .details-heading {
      font-size: 0.95rem;
      font-weight: 700;
      color: #334155;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 1rem;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.65rem;
      font-size: 0.9rem;
    }
    .detail-row .label {
      color: #64748b;
    }
    .detail-row .val {
      font-weight: 600;
      color: #0f2942;
    }
    .avail-tag {
      color: #059669;
    }
    .avail-tag.sold-out {
      color: #dc2626;
    }
    .price-breakdown {
      margin-top: 1.25rem;
      padding-top: 1.25rem;
      border-top: 1px dashed #cbd5e1;
    }
    .price-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.88rem;
      color: #64748b;
      margin-bottom: 0.5rem;
    }
    .price-row.total-row {
      border-top: 1px solid #e2e8f0;
      padding-top: 0.75rem;
      margin-top: 0.75rem;
    }
    .total-label {
      font-size: 1rem;
      font-weight: 700;
      color: #0f2942;
    }
    .total-val {
      font-size: 1.35rem;
      font-weight: 800;
      color: #003580;
    }
    .error-banner {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
    }
    .btn-return {
      display: inline-block;
      margin-top: 0.8rem;
      background: #006ce4;
      color: #ffffff;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
    }
    @media (max-width: 850px) {
      .booking-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BookingFormComponent implements OnInit {
  guestForm!: FormGroup;

  hotelId = 0;
  roomTypeId = 0;
  checkIn = '';
  checkOut = '';

  hotel: Hotel | null = null;
  estimate: EstimateResponse | null = null;
  loadingData = true;
  loadError = '';

  submitting = false;
  submitError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private hotelService: HotelService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.guestForm = this.fb.group({
      guestName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      guestEmail: ['', [Validators.required, Validators.email]]
    });

    this.route.queryParams.subscribe(params => {
      this.hotelId = +params['hotelId'];
      this.roomTypeId = +params['roomTypeId'];
      this.checkIn = params['checkIn'];
      this.checkOut = params['checkOut'];

      if (!this.hotelId || !this.checkIn || !this.checkOut) {
        this.loadError = 'Incomplete booking parameters. Please select hotel and stay dates.';
        this.loadingData = false;
        return;
      }

      this.loadBookingContext();
    });
  }

  loadBookingContext(): void {
    this.loadingData = true;
    this.loadError = '';

    // 1. Fetch hotel information
    this.hotelService.getHotelById(this.hotelId).subscribe({
      next: (hotelData) => {
        this.hotel = hotelData;
        if (!this.roomTypeId && hotelData.roomType) {
          this.roomTypeId = hotelData.roomType.id;
        }

        // 2. Fetch backend calculation estimate
        this.bookingService.calculateEstimate({
          hotelId: this.hotelId,
          checkInDate: this.checkIn,
          checkOutDate: this.checkOut
        }).subscribe({
          next: (est) => {
            this.estimate = est;
            this.loadingData = false;
          },
          error: (err) => {
            this.loadError = err.error?.message || 'Could not calculate stay estimate from server.';
            this.loadingData = false;
          }
        });
      },
      error: () => {
        this.loadError = 'Hotel not found on server.';
        this.loadingData = false;
      }
    });
  }

  onSubmitBooking(): void {
    if (this.guestForm.invalid || !this.hotel || !this.estimate) {
      this.guestForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.submitError = '';

    const payload = {
      hotelId: this.hotel.id,
      roomTypeId: this.roomTypeId || this.hotel.roomType!.id,
      guestName: this.guestForm.value.guestName.trim(),
      guestEmail: this.guestForm.value.guestEmail.trim().toLowerCase(),
      checkInDate: this.checkIn,
      checkOutDate: this.checkOut
    };

    this.bookingService.createBooking(payload).subscribe({
      next: (bookingResponse) => {
        this.submitting = false;
        this.router.navigate(['/confirmation', bookingResponse.bookingReference], {
          queryParams: { email: bookingResponse.guestEmail }
        });
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = err.error?.message || 'Failed to complete booking. Please try again.';
      }
    });
  }
}
