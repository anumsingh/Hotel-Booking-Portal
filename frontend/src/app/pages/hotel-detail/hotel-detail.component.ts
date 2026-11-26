import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HotelService } from '../../services/hotel.service';
import { BookingService } from '../../services/booking.service';
import { Hotel } from '../../models/hotel.model';
import { AvailabilityResponse } from '../../models/availability.model';
import { AlternativeHotel } from '../../models/alternative-hotel.model';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="hotel-detail-page">
      <!-- Loading state -->
      <app-loading-spinner *ngIf="loadingHotel" message="Loading hotel details..."></app-loading-spinner>

      <!-- Error State -->
      <div *ngIf="errorMessage && !loadingHotel" class="error-container">
        <h2>Hotel Not Found</h2>
        <p>{{ errorMessage }}</p>
        <a routerLink="/hotels" class="btn-back">Back to Hotels</a>
      </div>

      <div *ngIf="hotel && !loadingHotel" class="detail-container">
        <!-- TOP BREADCRUMB -->
        <nav class="breadcrumb">
          <a routerLink="/">Home</a> &gt;
          <a routerLink="/hotels">Hotels</a> &gt;
          <span>{{ hotel.name }}</span>
        </nav>

        <!-- TITLE & HEADER -->
        <div class="hotel-header">
          <div>
            <div class="location-pill">📍 {{ hotel.location }}</div>
            <h1 class="hotel-title">{{ hotel.name }}</h1>
          </div>
          <div class="rating-box">
            <span class="rating-score">★ 4.9 / 5.0</span>
            <span class="review-count">Verified Luxury Reviews</span>
          </div>
        </div>

        <!-- IMAGE GALLERY -->
        <div class="gallery-grid">
          <div class="main-image">
            <img [src]="galleryImages[0]" [alt]="hotel.name" (error)="onImageError($event, 0)">
          </div>
          <div class="sub-images">
            <div class="sub-img-wrap" *ngFor="let img of galleryImages.slice(1, 4); let idx = index">
              <img [src]="img" [alt]="hotel.name + ' preview ' + (idx + 1)" (error)="onImageError($event, idx + 1)">
            </div>
          </div>
        </div>

        <!-- MAIN CONTENT + BOOKING SIDEBAR GRID -->
        <div class="detail-grid">
          <!-- LEFT: DESCRIPTION & AMENITIES -->
          <div class="info-column">
            <!-- Room Category Card -->
            <div class="section-card room-category-card" *ngIf="hotel.roomType">
              <div class="room-cat-header">
                <div>
                  <span class="cat-label">Room Category</span>
                  <h2 class="room-title">{{ hotel.roomType.roomName }}</h2>
                </div>
                <div class="room-capacity-badge">
                  Total Capacity: <strong>{{ hotel.roomType.totalRooms }} Rooms</strong>
                </div>
              </div>
              <p class="room-rate">
                <span class="rate-currency">₹</span>{{ hotel.roomType.pricePerNight | number:'1.0-0' }}
                <span class="rate-period">/ night</span>
              </p>
            </div>

            <!-- Overview Description -->
            <div class="section-card">
              <h3 class="card-heading">Hotel Overview</h3>
              <p class="hotel-desc">{{ hotel.description }}</p>
            </div>

            <!-- Amenities -->
            <div class="section-card" *ngIf="amenityList.length">
              <h3 class="card-heading">Room &amp; Property Amenities</h3>
              <div class="amenities-grid">
                <div *ngFor="let amenity of amenityList" class="amenity-item">
                  <span class="check-icon">✓</span>
                  <span>{{ amenity }}</span>
                </div>
              </div>
            </div>

            <!-- SURPRISE FEATURE: SMART ALTERNATIVE RECOMMENDATIONS -->
            <div class="section-card alternatives-section" *ngIf="availability && !availability.isAvailable">
              <div class="no-rooms-alert">
                <span class="alert-icon">⚠️</span>
                <div>
                  <h4 class="alert-title">No Rooms Available for Selected Dates</h4>
                  <p class="alert-text">All {{ hotel.roomType?.totalRooms }} rooms at {{ hotel.name }} are fully reserved from {{ availability.checkInDate }} to {{ availability.checkOutDate }}.</p>
                </div>
              </div>

              <!-- Recommendation Header -->
              <div class="alt-header">
                <span class="alt-tag">Smart Alternative Recommendations</span>
                <h3 class="alt-title">Available Hotels in {{ hotel.location }}</h3>
                <p class="alt-desc">We found these matching hotels in {{ hotel.location }} with available rooms for your exact dates:</p>
              </div>

              <app-loading-spinner *ngIf="loadingAlternatives" message="Finding available hotels in {{ hotel.location }}..."></app-loading-spinner>

              <div *ngIf="!loadingAlternatives && alternatives.length > 0" class="alternatives-grid">
                <div *ngFor="let alt of alternatives" class="alt-card">
                  <img [src]="alt.imageUrl" [alt]="alt.hotelName" class="alt-img">
                  <div class="alt-info">
                    <span class="alt-city">📍 {{ alt.location }}</span>
                    <h4 class="alt-name">{{ alt.hotelName }}</h4>
                    <span class="alt-room-cat">{{ alt.roomName }}</span>
                    <div class="alt-avail-badge">
                      ✓ {{ alt.availableRooms }} rooms available
                    </div>
                    <div class="alt-price">
                      <strong>₹{{ alt.pricePerNight | number:'1.0-0' }}</strong> / night
                    </div>
                    <button (click)="navigateToAlternative(alt.hotelId)" class="btn-alt-book">
                      View &amp; Book Alternative
                    </button>
                  </div>
                </div>
              </div>

              <div *ngIf="!loadingAlternatives && alternatives.length === 0" class="no-alt-box">
                <p>Sorry, no alternative hotels are available for your selected dates in {{ hotel.location }}.</p>
              </div>
            </div>
          </div>

          <!-- RIGHT: AVAILABILITY & BOOKING WIDGET -->
          <div class="booking-sidebar">
            <div class="booking-card">
              <div class="booking-card-header">
                <h3 class="booking-title">Check Stay &amp; Reserve</h3>
                <p class="booking-sub">Live availability from MySQL database</p>
              </div>

              <form [formGroup]="dateForm" class="date-form">
                <div class="form-group">
                  <label for="detailCheckIn">Check-in Date</label>
                  <input 
                    type="date" 
                    id="detailCheckIn" 
                    formControlName="checkIn" 
                    [min]="minCheckIn"
                    (change)="onDateChange()"
                    class="form-control"
                  />
                </div>

                <div class="form-group">
                  <label for="detailCheckOut">Check-out Date</label>
                  <input 
                    type="date" 
                    id="detailCheckOut" 
                    formControlName="checkOut" 
                    [min]="minCheckOut"
                    (change)="onDateChange()"
                    class="form-control"
                  />
                </div>
              </form>

              <!-- Date Error -->
              <div *ngIf="dateValidationMsg" class="validation-msg">
                ⚠️ {{ dateValidationMsg }}
              </div>

              <!-- Live Availability Status -->
              <div class="availability-status" *ngIf="availability && !checkingAvailability && !dateValidationMsg">
                <div class="status-indicator" [class.available]="availability.isAvailable" [class.unavailable]="!availability.isAvailable">
                  <span class="status-dot"></span>
                  <span *ngIf="availability.isAvailable">
                    <strong>{{ availability.availableRooms }}</strong> of {{ availability.totalRooms }} rooms available!
                  </span>
                  <span *ngIf="!availability.isAvailable">
                    <strong>Sold Out</strong> (0 rooms available)
                  </span>
                </div>

                <div class="calculation-summary">
                  <div class="calc-row">
                    <span>Stay Duration:</span>
                    <strong>{{ availability.numberOfNights }} Night{{ availability.numberOfNights > 1 ? 's' : '' }}</strong>
                  </div>
                  <div class="calc-row">
                    <span>Rate per night:</span>
                    <strong>₹{{ availability.pricePerNight | number:'1.0-0' }}</strong>
                  </div>
                  <div class="calc-row total-row">
                    <span>Total Estimated Price:</span>
                    <strong class="total-price">₹{{ availability.totalAmount | number:'1.0-0' }}</strong>
                  </div>
                  <span class="tax-note">Includes all taxes and verified room charges</span>
                </div>

                <button 
                  [disabled]="!availability.isAvailable" 
                  (click)="proceedToBooking()"
                  class="btn-book-now"
                  [class.disabled]="!availability.isAvailable">
                  {{ availability.isAvailable ? 'Reserve Now' : 'Room Unavailable' }}
                </button>
              </div>

              <div *ngIf="checkingAvailability" class="checking-state">
                <div class="mini-spinner"></div>
                <span>Checking room availability...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hotel-detail-page {
      background-color: #f8fafc;
      min-height: calc(100vh - 70px);
      padding: 2.5rem 1.5rem 5rem;
    }
    .detail-container {
      max-width: 1240px;
      margin: 0 auto;
    }
    .breadcrumb {
      font-size: 0.88rem;
      color: #64748b;
      margin-bottom: 1.5rem;
    }
    .breadcrumb a {
      color: #2563eb;
      text-decoration: none;
      font-weight: 500;
    }
    .hotel-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.75rem;
      flex-wrap: wrap;
      gap: 1.25rem;
    }
    .location-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #dbeafe;
      font-size: 0.84rem;
      font-weight: 600;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      margin-bottom: 0.6rem;
    }
    .hotel-title {
      font-size: 2.35rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.025em;
      line-height: 1.2;
    }
    .rating-box {
      text-align: right;
    }
    .rating-score {
      display: inline-block;
      background: linear-gradient(135deg, #0a1128 0%, #1e293b 100%);
      color: #f59e0b;
      font-weight: 800;
      font-size: 1.15rem;
      padding: 0.45rem 1rem;
      border-radius: 10px;
      border: 1px solid rgba(245, 158, 11, 0.35);
      box-shadow: 0 4px 12px rgba(10, 17, 40, 0.15);
    }
    .review-count {
      font-size: 0.78rem;
      color: #64748b;
      margin-top: 0.35rem;
      display: block;
      font-weight: 500;
    }
    .gallery-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1rem;
      margin-bottom: 2.75rem;
      height: 440px;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(10, 17, 40, 0.08);
      border: 1px solid #e2e8f0;
    }
    .main-image {
      height: 100%;
      overflow: hidden;
      background: #0a1128;
    }
    .main-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    .gallery-grid:hover .main-image img {
      transform: scale(1.02);
    }
    .sub-images {
      display: grid;
      grid-template-rows: repeat(3, 1fr);
      gap: 0.75rem;
      height: 100%;
    }
    .sub-img-wrap {
      overflow: hidden;
      background: #0a1128;
      border-radius: 10px;
    }
    .sub-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.35s ease;
    }
    .sub-img-wrap:hover img {
      transform: scale(1.06);
    }
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 390px;
      gap: 2.5rem;
      align-items: flex-start;
    }
    .section-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.85rem;
      margin-bottom: 1.6rem;
      box-shadow: 0 4px 18px rgba(10, 17, 40, 0.04);
    }
    .room-category-card {
      border-left: 4px solid #f59e0b;
      background: linear-gradient(135deg, #ffffff 0%, #fffdf5 100%);
    }
    .room-cat-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .cat-label {
      font-size: 0.78rem;
      text-transform: uppercase;
      font-weight: 700;
      color: #b45309;
      letter-spacing: 0.08em;
    }
    .room-title {
      font-size: 1.45rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0.25rem 0 0;
      letter-spacing: -0.015em;
    }
    .room-capacity-badge {
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      font-size: 0.82rem;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      font-weight: 600;
    }
    .room-rate {
      font-size: 1.55rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0.6rem 0 0;
    }
    .rate-currency {
      font-size: 1.15rem;
      color: #1d4ed8;
      margin-right: 2px;
    }
    .rate-period {
      font-size: 0.9rem;
      font-weight: 500;
      color: #64748b;
    }
    .card-heading {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 1rem;
      letter-spacing: -0.01em;
    }
    .hotel-desc {
      color: #475569;
      line-height: 1.7;
      margin: 0;
      font-size: 0.96rem;
    }
    .amenities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
      gap: 0.85rem;
    }
    .amenity-item {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      color: #334155;
      font-size: 0.92rem;
      font-weight: 500;
    }
    .check-icon {
      color: #059669;
      font-weight: 800;
      background: #ecfdf5;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      flex-shrink: 0;
    }
    .alternatives-section {
      background: #fffdf5;
      border: 1.5px solid #fde68a;
      border-radius: 16px;
    }
    .no-rooms-alert {
      display: flex;
      gap: 0.85rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      padding: 1.1rem;
      border-radius: 10px;
      margin-bottom: 1.5rem;
    }
    .alert-icon {
      font-size: 1.6rem;
    }
    .alert-title {
      margin: 0 0 0.25rem;
      color: #991b1b;
      font-size: 1.05rem;
      font-weight: 700;
    }
    .alert-text {
      margin: 0;
      color: #7f1d1d;
      font-size: 0.88rem;
    }
    .alt-header {
      margin-bottom: 1.25rem;
    }
    .alt-tag {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
    }
    .alt-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0.5rem 0 0.25rem;
      letter-spacing: -0.015em;
    }
    .alt-desc {
      color: #64748b;
      font-size: 0.92rem;
      margin: 0;
    }
    .alternatives-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.25rem;
    }
    .alt-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(10, 17, 40, 0.06);
      transition: transform 0.2s ease;
    }
    .alt-card:hover {
      transform: translateY(-3px);
    }
    .alt-img {
      width: 100%;
      height: 140px;
      object-fit: cover;
    }
    .alt-info {
      padding: 1.1rem;
    }
    .alt-city {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 600;
    }
    .alt-name {
      font-size: 1.08rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0.25rem 0;
    }
    .alt-room-cat {
      font-size: 0.82rem;
      color: #64748b;
      display: block;
      margin-bottom: 0.5rem;
    }
    .alt-avail-badge {
      display: inline-block;
      background: #ecfdf5;
      color: #065f46;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      margin-bottom: 0.65rem;
    }
    .alt-price {
      font-size: 0.95rem;
      color: #0f172a;
      margin-bottom: 0.85rem;
    }
    .alt-price strong {
      color: #1d4ed8;
      font-size: 1.15rem;
    }
    .btn-alt-book {
      width: 100%;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 0.65rem;
      font-weight: 700;
      font-size: 0.88rem;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
      transition: all 0.2s;
    }
    .btn-alt-book:hover {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
    }
    .no-alt-box {
      background: #f1f5f9;
      padding: 1.25rem;
      border-radius: 10px;
      text-align: center;
      color: #64748b;
      font-size: 0.92rem;
    }
    .booking-sidebar {
      position: sticky;
      top: 90px;
    }
    .booking-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 16px;
      padding: 1.65rem;
      box-shadow: 0 8px 30px rgba(10, 17, 40, 0.08);
    }
    .booking-card-header {
      margin-bottom: 1.35rem;
      padding-bottom: 0.85rem;
      border-bottom: 1px solid #f1f5f9;
    }
    .booking-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.2rem;
      letter-spacing: -0.01em;
    }
    .booking-sub {
      color: #64748b;
      font-size: 0.82rem;
      margin: 0;
    }
    .form-group {
      margin-bottom: 1.1rem;
    }
    .form-group label {
      display: block;
      font-size: 0.84rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.35rem;
    }
    .form-control {
      width: 100%;
      padding: 0.75rem 0.9rem;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.92rem;
      box-sizing: border-box;
      font-family: inherit;
      background: #f8fafc;
      transition: all 0.2s;
    }
    .form-control:focus {
      outline: none;
      border-color: #2563eb;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }
    .validation-msg {
      background: #fef2f2;
      color: #dc2626;
      padding: 0.65rem 0.85rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      margin: 1rem 0;
      border: 1px solid #fecaca;
    }
    .availability-status {
      margin-top: 1.25rem;
    }
    .status-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 0.9rem;
      border-radius: 8px;
      font-size: 0.88rem;
      margin: 1rem 0;
      font-weight: 600;
    }
    .status-indicator.available {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    .status-indicator.unavailable {
      background: #fef2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }
    .calculation-summary {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.15rem;
      margin-bottom: 1.35rem;
    }
    .calc-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.88rem;
      color: #475569;
      margin-bottom: 0.55rem;
    }
    .calc-row.total-row {
      border-top: 1px solid #cbd5e1;
      padding-top: 0.75rem;
      margin-top: 0.75rem;
      color: #0f172a;
      font-size: 1.05rem;
    }
    .total-price {
      color: #1d4ed8;
      font-size: 1.45rem;
      font-weight: 800;
    }
    .tax-note {
      display: block;
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.4rem;
    }
    .btn-book-now {
      width: 100%;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      border: none;
      border-radius: 10px;
      padding: 0.95rem;
      font-size: 1.05rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
      transition: all 0.25s ease;
    }
    .btn-book-now:hover:not(.disabled) {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
      transform: translateY(-1px);
    }
    .btn-book-now.disabled {
      background: #94a3b8;
      box-shadow: none;
      cursor: not-allowed;
    }
    .checking-state {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      color: #64748b;
      font-size: 0.85rem;
      padding: 1rem 0;
      justify-content: center;
    }
    .mini-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #cbd5e1;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .error-container {
      background: #ffffff;
      padding: 3rem;
      border-radius: 16px;
      text-align: center;
      max-width: 600px;
      margin: 2rem auto;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 16px rgba(10, 17, 40, 0.05);
    }
    .btn-back {
      display: inline-block;
      margin-top: 1rem;
      background: #2563eb;
      color: #ffffff;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
    }
    @media (max-width: 950px) {
      .gallery-grid {
        grid-template-columns: 1fr;
        height: auto;
      }
      .sub-images {
        display: none;
      }
      .main-image {
        height: 280px;
      }
      .detail-grid {
        grid-template-columns: 1fr;
      }
      .booking-sidebar {
        position: static;
      }
    }
  `]
})
export class HotelDetailComponent implements OnInit {
  hotel: Hotel | null = null;
  loadingHotel = true;
  errorMessage = '';

  dateForm!: FormGroup;
  minCheckIn = '';
  minCheckOut = '';
  dateValidationMsg = '';

  availability: AvailabilityResponse | null = null;
  checkingAvailability = false;

  alternatives: AlternativeHotel[] = [];
  loadingAlternatives = false;

  galleryImages: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private hotelService: HotelService
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const defaultCheckOut = new Date(tomorrow);
    defaultCheckOut.setDate(tomorrow.getDate() + 3);

    this.minCheckIn = this.formatDate(today);
    this.minCheckOut = this.formatDate(tomorrow);

    this.dateForm = this.fb.group({
      checkIn: [this.formatDate(tomorrow), Validators.required],
      checkOut: [this.formatDate(defaultCheckOut), Validators.required]
    });

    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadHotel(id);
      }
    });

    this.route.queryParams.subscribe(qParams => {
      if (qParams['checkIn'] && qParams['checkOut']) {
        this.dateForm.patchValue({
          checkIn: qParams['checkIn'],
          checkOut: qParams['checkOut']
        });
      }
    });
  }

  loadHotel(id: number): void {
    this.loadingHotel = true;
    this.errorMessage = '';

    this.hotelService.getHotelById(id).subscribe({
      next: (data) => {
        this.hotel = data;
        this.buildGalleryImages(data.imageUrl);
        this.loadingHotel = false;
        this.checkAvailability();
      },
      error: (err) => {
        this.errorMessage = 'Could not find the requested hotel.';
        this.loadingHotel = false;
      }
    });
  }

  buildGalleryImages(primaryUrl: string): void {
    this.galleryImages = [
      primaryUrl,
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80'
    ];
  }

  onImageError(event: any, index: number): void {
    const fallback = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
    event.target.src = fallback;
  }

  get amenityList(): string[] {
    if (!this.hotel?.roomType?.amenities) return [];
    return this.hotel.roomType.amenities.split(',').map(s => s.trim());
  }

  onDateChange(): void {
    this.checkAvailability();
  }

  checkAvailability(): void {
    this.dateValidationMsg = '';
    const { checkIn, checkOut } = this.dateForm.value;

    if (!checkIn || !checkOut) {
      this.dateValidationMsg = 'Please select both check-in and check-out dates.';
      return;
    }

    if (checkOut <= checkIn) {
      this.dateValidationMsg = 'Check-out date must be strictly after check-in date.';
      return;
    }

    if (!this.hotel) return;

    this.checkingAvailability = true;
    this.hotelService.checkAvailability(this.hotel.id, checkIn, checkOut).subscribe({
      next: (res) => {
        this.availability = res;
        this.checkingAvailability = false;

        // Surprise Feature Trigger: If available rooms === 0, fetch alternative hotels!
        if (!res.isAvailable) {
          this.loadAlternatives(this.hotel!.id, checkIn, checkOut);
        } else {
          this.alternatives = [];
        }
      },
      error: (err) => {
        this.dateValidationMsg = err.error?.message || 'Error checking availability.';
        this.checkingAvailability = false;
      }
    });
  }

  loadAlternatives(hotelId: number, checkIn: string, checkOut: string): void {
    this.loadingAlternatives = true;
    this.hotelService.getAlternativeHotels(hotelId, checkIn, checkOut).subscribe({
      next: (alts) => {
        this.alternatives = alts;
        this.loadingAlternatives = false;
      },
      error: () => {
        this.alternatives = [];
        this.loadingAlternatives = false;
      }
    });
  }

  navigateToAlternative(altHotelId: number): void {
    const { checkIn, checkOut } = this.dateForm.value;
    this.router.navigate(['/hotels', altHotelId], {
      queryParams: { checkIn, checkOut }
    });
  }

  proceedToBooking(): void {
    if (!this.hotel || !this.availability || !this.availability.isAvailable) return;

    this.router.navigate(['/booking'], {
      queryParams: {
        hotelId: this.hotel.id,
        roomTypeId: this.availability.roomTypeId,
        checkIn: this.availability.checkInDate,
        checkOut: this.availability.checkOutDate
      }
    });
  }

  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
