import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HotelService } from '../../services/hotel.service';
import { Hotel } from '../../models/hotel.model';
import { HotelCardComponent } from '../../components/hotel-card/hotel-card.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HotelCardComponent, LoadingSpinnerComponent],
  template: `
    <div class="home-page">
      <!-- HERO SECTION -->
      <section class="hero-section">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <span class="hero-tag">Premium Stays &amp; Unmatched Hospitality</span>
          <h1 class="hero-title">Find Your Perfect Stay</h1>
          <p class="hero-subtitle">Discover comfortable hotels and book your next stay with ease.</p>

          <!-- SEARCH FORM -->
          <div class="search-box-card">
            <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="search-form">
              <div class="form-group location-group">
                <label for="location">
                  <span class="label-icon">📍</span> Destination / City
                </label>
                <input 
                  type="text" 
                  id="location" 
                  formControlName="location" 
                  placeholder="e.g. Mumbai, Goa, Manali, Pune"
                  class="form-control"
                />
              </div>

              <div class="form-group date-group">
                <label for="checkIn">
                  <span class="label-icon">📅</span> Check-in Date
                </label>
                <input 
                  type="date" 
                  id="checkIn" 
                  formControlName="checkIn" 
                  [min]="minCheckIn"
                  (change)="onCheckInChange()"
                  class="form-control"
                />
              </div>

              <div class="form-group date-group">
                <label for="checkOut">
                  <span class="label-icon">📅</span> Check-out Date
                </label>
                <input 
                  type="date" 
                  id="checkOut" 
                  formControlName="checkOut" 
                  [min]="minCheckOut"
                  class="form-control"
                />
              </div>

              <div class="form-group btn-group">
                <button type="submit" class="btn-search">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  Search Hotels
                </button>
              </div>
            </form>
            <div *ngIf="dateError" class="search-validation-error">
              ⚠️ {{ dateError }}
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURED HOTELS SECTION -->
      <section class="featured-section">
        <div class="section-container">
          <div class="section-header">
            <div>
              <span class="section-sub">Hand-Picked Recommendations</span>
              <h2 class="section-title">Featured Luxury Hotels</h2>
            </div>
            <a routerLink="/hotels" class="link-view-all">
              View All Hotels ({{ featuredHotels.length }})
              <span>&rarr;</span>
            </a>
          </div>

          <!-- Loading Indicator -->
          <app-loading-spinner *ngIf="loading" message="Loading luxury hotels from server..."></app-loading-spinner>

          <!-- Error Alert -->
          <div *ngIf="errorMessage && !loading" class="error-banner">
            <p>{{ errorMessage }}</p>
            <button (click)="loadFeaturedHotels()" class="btn-retry">Retry</button>
          </div>

          <!-- Hotel Grid -->
          <div *ngIf="!loading && !errorMessage" class="hotels-grid">
            <app-hotel-card 
              *ngFor="let hotel of featuredHotels" 
              [hotel]="hotel"
              [queryParams]="getQueryParams()">
            </app-hotel-card>
          </div>
        </div>
      </section>

      <!-- WHY CHOOSE US SECTION -->
      <section class="why-us-section">
        <div class="section-container">
          <div class="why-header text-center">
            <span class="section-sub">Unmatched Trust &amp; Convenience</span>
            <h2 class="section-title">Why Choose Hotel Booking Portal</h2>
            <p class="why-desc">We combine direct backend hotel availability, transparent pricing, and instant confirmations.</p>
          </div>

          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon-wrap">
                <span class="feature-icon">⚡</span>
              </div>
              <h3 class="feature-title">Easy Booking</h3>
              <p class="feature-text">
                Intuitive search, live room availability checks, and streamlined two-click confirmations without cumbersome steps.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon-wrap">
                <span class="feature-icon">🛡️</span>
              </div>
              <h3 class="feature-title">Verified Hotel Information</h3>
              <p class="feature-text">
                Every hotel details its verified room capacity, high-resolution photographs, authentic amenities, and exact location.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon-wrap">
                <span class="feature-icon">💰</span>
              </div>
              <h3 class="feature-title">Transparent Pricing</h3>
              <p class="feature-text">
                All pricing is calculated by the backend using strict decimal math. What you see is what you pay—no surprise hidden fees.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon-wrap">
                <span class="feature-icon">🔄</span>
              </div>
              <h3 class="feature-title">Easy Cancellation</h3>
              <p class="feature-text">
                Plans change? Cancel any active confirmed booking instantly using your booking reference and email, immediately releasing your room.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-page {
      background-color: #f8fafc;
    }
    .hero-section {
      position: relative;
      background-image: url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80');
      background-size: cover;
      background-position: center 35%;
      min-height: 520px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4rem 1.5rem;
    }
    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(180deg, rgba(15, 41, 66, 0.78) 0%, rgba(0, 53, 128, 0.85) 100%);
    }
    .hero-content {
      position: relative;
      z-index: 10;
      max-width: 1050px;
      width: 100%;
      text-align: center;
      color: #ffffff;
    }
    .hero-tag {
      display: inline-block;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(4px);
      color: #ebf3ff;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.4rem 1rem;
      border-radius: 30px;
      margin-bottom: 1.2rem;
      letter-spacing: 0.5px;
      border: 1px solid rgba(255, 255, 255, 0.25);
    }
    .hero-title {
      font-size: 3rem;
      font-weight: 800;
      margin: 0 0 0.8rem;
      letter-spacing: -0.5px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    }
    .hero-subtitle {
      font-size: 1.2rem;
      font-weight: 400;
      color: #e2eeff;
      max-width: 650px;
      margin: 0 auto 2.5rem;
      line-height: 1.5;
    }
    .search-box-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.22);
      text-align: left;
    }
    .search-form {
      display: grid;
      grid-template-columns: 2fr 1.3fr 1.3fr 1.4fr;
      gap: 1rem;
      align-items: flex-end;
    }
    .form-group {
      display: flex;
      flex-direction: column;
    }
    .form-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.4rem;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
    .form-control {
      width: 100%;
      padding: 0.75rem 0.9rem;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.95rem;
      color: #0f2942;
      background: #ffffff;
      box-sizing: border-box;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .form-control:focus {
      outline: none;
      border-color: #006ce4;
      box-shadow: 0 0 0 3px rgba(0, 108, 228, 0.15);
    }
    .btn-search {
      background: #006ce4;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 0.8rem 1.2rem;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: background 0.2s, transform 0.15s;
      height: 47px;
    }
    .btn-search:hover {
      background: #0056b3;
      transform: translateY(-1px);
    }
    .search-validation-error {
      margin-top: 0.75rem;
      color: #dc2626;
      font-size: 0.85rem;
      font-weight: 500;
      padding: 0.4rem 0.6rem;
      background: #fef2f2;
      border-radius: 6px;
    }
    .featured-section {
      padding: 4.5rem 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2.2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .section-sub {
      color: #006ce4;
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      display: block;
      margin-bottom: 0.3rem;
    }
    .section-title {
      font-size: 2.1rem;
      font-weight: 800;
      color: #0f2942;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .link-view-all {
      color: #006ce4;
      font-weight: 600;
      text-decoration: none;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: gap 0.2s;
    }
    .link-view-all:hover {
      gap: 0.7rem;
      color: #003580;
    }
    .hotels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.8rem;
    }
    .error-banner {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 1.2rem;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-retry {
      background: #991b1b;
      color: #ffffff;
      border: none;
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      cursor: pointer;
    }
    .why-us-section {
      background: #ffffff;
      padding: 5rem 1.5rem;
      border-top: 1px solid #e2e8f0;
    }
    .section-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .text-center {
      text-align: center;
    }
    .why-desc {
      color: #64748b;
      font-size: 1.05rem;
      max-width: 600px;
      margin: 0.6rem auto 3rem;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 2rem;
    }
    .feature-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 2rem 1.5rem;
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 20px rgba(15, 41, 66, 0.08);
      border-color: #cbd5e1;
    }
    .feature-icon-wrap {
      width: 60px;
      height: 60px;
      margin: 0 auto 1.25rem;
      background: #ebf3ff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .feature-icon {
      font-size: 1.8rem;
    }
    .feature-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f2942;
      margin: 0 0 0.6rem;
    }
    .feature-text {
      color: #64748b;
      font-size: 0.9rem;
      line-height: 1.6;
      margin: 0;
    }
    @media (max-width: 900px) {
      .hero-title {
        font-size: 2.2rem;
      }
      .search-form {
        grid-template-columns: 1fr;
      }
      .btn-search {
        margin-top: 0.5rem;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  searchForm!: FormGroup;
  featuredHotels: Hotel[] = [];
  loading = true;
  errorMessage = '';
  dateError = '';

  minCheckIn = '';
  minCheckOut = '';

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const defaultCheckOut = new Date(tomorrow);
    defaultCheckOut.setDate(tomorrow.getDate() + 3);

    this.minCheckIn = this.formatDate(today);
    this.minCheckOut = this.formatDate(tomorrow);

    this.searchForm = this.fb.group({
      location: [''],
      checkIn: [this.formatDate(tomorrow), Validators.required],
      checkOut: [this.formatDate(defaultCheckOut), Validators.required]
    });

    this.loadFeaturedHotels();
  }

  loadFeaturedHotels(): void {
    this.loading = true;
    this.errorMessage = '';
    this.hotelService.getAllHotels().subscribe({
      next: (hotels) => {
        this.featuredHotels = hotels;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Unable to connect to the backend server. Please verify MySQL and Spring Boot are running.';
        this.loading = false;
      }
    });
  }

  onCheckInChange(): void {
    const checkInVal = this.searchForm.get('checkIn')?.value;
    if (checkInVal) {
      const nextDay = new Date(checkInVal);
      nextDay.setDate(nextDay.getDate() + 1);
      this.minCheckOut = this.formatDate(nextDay);

      const checkOutVal = this.searchForm.get('checkOut')?.value;
      if (checkOutVal && checkOutVal <= checkInVal) {
        this.searchForm.patchValue({ checkOut: this.formatDate(nextDay) });
      }
    }
  }

  onSearch(): void {
    this.dateError = '';
    const { location, checkIn, checkOut } = this.searchForm.value;

    if (!checkIn || !checkOut) {
      this.dateError = 'Please select both check-in and check-out dates.';
      return;
    }

    if (checkOut <= checkIn) {
      this.dateError = 'Check-out date must be strictly after check-in date.';
      return;
    }

    const queryParams: any = { checkIn, checkOut };
    if (location && location.trim()) {
      queryParams.location = location.trim();
    }

    this.router.navigate(['/hotels'], { queryParams });
  }

  getQueryParams(): any {
    const { checkIn, checkOut } = this.searchForm?.value || {};
    if (checkIn && checkOut) {
      return { checkIn, checkOut };
    }
    return {};
  }

  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
