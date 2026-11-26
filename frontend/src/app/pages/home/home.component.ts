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
          <div class="hero-tag">
            <span class="sparkle">✨</span> Handcrafted Luxury Stays &amp; Royal Escapes
          </div>
          <h1 class="hero-title">Find Your Perfect Stay</h1>
          <p class="hero-subtitle">Discover majestic palaces, beachfront villas, and serene mountain chalets with instant live confirmation.</p>

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
                  placeholder="e.g. Udaipur, Goa, Mumbai, Manali"
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
                  Search Stays
                </button>
              </div>
            </form>

            <div class="quick-dest-row">
              <span class="quick-label">Trending Destinations:</span>
              <div class="quick-chips">
                <button type="button" class="quick-chip" (click)="setDestination('Udaipur')">Udaipur</button>
                <button type="button" class="quick-chip" (click)="setDestination('Goa')">Goa</button>
                <button type="button" class="quick-chip" (click)="setDestination('Mumbai')">Mumbai</button>
                <button type="button" class="quick-chip" (click)="setDestination('Manali')">Manali</button>
                <button type="button" class="quick-chip" (click)="setDestination('Bengaluru')">Bengaluru</button>
              </div>
            </div>

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
              <span class="section-sub">Curated Selection</span>
              <h2 class="section-title">Featured Luxury Properties</h2>
            </div>
            <a routerLink="/hotels" class="link-view-all">
              <span>View All Properties ({{ featuredHotels.length }})</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>

          <!-- Loading Indicator -->
          <app-loading-spinner *ngIf="loading" message="Loading luxury hotels from server..."></app-loading-spinner>

          <!-- Error Alert -->
          <div *ngIf="errorMessage && !loading" class="error-banner">
            <p>{{ errorMessage }}</p>
            <button (click)="loadFeaturedHotels()" class="btn-retry">Retry Connection</button>
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
            <span class="section-sub">The Gold Standard</span>
            <h2 class="section-title">Why Reserve with Us</h2>
            <p class="why-desc">Experience frictionless travel with verified hotel inventory, transparent billing, and instant room reservations.</p>
          </div>

          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon-wrap icon-blue">
                <span class="feature-icon">⚡</span>
              </div>
              <h3 class="feature-title">Instant Live Booking</h3>
              <p class="feature-text">
                Real-time synchronized inventory checks directly with our backend database. No waiting or unconfirmed vouchers.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon-wrap icon-gold">
                <span class="feature-icon">👑</span>
              </div>
              <h3 class="feature-title">Verified Luxury Stays</h3>
              <p class="feature-text">
                Every property features verified room capacities, high-resolution photography, authentic amenities, and prime locations.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon-wrap icon-emerald">
                <span class="feature-icon">💎</span>
              </div>
              <h3 class="feature-title">Zero Hidden Fees</h3>
              <p class="feature-text">
                All prices calculated strictly using server-side decimal math. Complete breakdown of nights, room rates, and totals upfront.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon-wrap icon-rose">
                <span class="feature-icon">🛡️</span>
              </div>
              <h3 class="feature-title">Secure Cancellation</h3>
              <p class="feature-text">
                Plans shift? Look up your reservation using reference &amp; email, then cancel securely with single-use cryptographic verification.
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
      background-image: url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80');
      background-size: cover;
      background-position: center 40%;
      min-height: 560px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4.5rem 1.5rem;
    }
    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(180deg, rgba(6, 12, 29, 0.82) 0%, rgba(10, 17, 40, 0.88) 100%);
    }
    .hero-content {
      position: relative;
      z-index: 10;
      max-width: 1080px;
      width: 100%;
      text-align: center;
      color: #ffffff;
    }
    .hero-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(8px);
      color: #f8fafc;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.45rem 1.1rem;
      border-radius: 9999px;
      margin-bottom: 1.3rem;
      letter-spacing: 0.04em;
      border: 1px solid rgba(255, 255, 255, 0.22);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
    .sparkle {
      color: #f59e0b;
    }
    .hero-title {
      font-size: 3.25rem;
      font-weight: 800;
      margin: 0 0 0.85rem;
      letter-spacing: -0.03em;
      line-height: 1.15;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }
    .hero-subtitle {
      font-size: 1.18rem;
      font-weight: 400;
      color: #e2e8f0;
      max-width: 680px;
      margin: 0 auto 2.8rem;
      line-height: 1.6;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
    .search-box-card {
      background: #ffffff;
      border-radius: 20px;
      padding: 1.5rem 1.75rem;
      box-shadow: 0 20px 45px rgba(6, 12, 29, 0.3);
      text-align: left;
      border: 1px solid rgba(255, 255, 255, 0.8);
    }
    .search-form {
      display: grid;
      grid-template-columns: 2fr 1.3fr 1.3fr 1.4fr;
      gap: 1.1rem;
      align-items: flex-end;
    }
    .form-group {
      display: flex;
      flex-direction: column;
    }
    .form-group label {
      font-size: 0.84rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.45rem;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .form-control {
      width: 100%;
      padding: 0.82rem 1rem;
      border: 1.5px solid #cbd5e1;
      border-radius: 10px;
      font-size: 0.95rem;
      color: #0f172a;
      background: #f8fafc;
      box-sizing: border-box;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .form-control:focus {
      outline: none;
      background: #ffffff;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }
    .btn-search {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      border: none;
      border-radius: 10px;
      padding: 0.85rem 1.4rem;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
      transition: all 0.25s ease;
      height: 49px;
    }
    .btn-search:hover {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
      transform: translateY(-1px);
    }
    .quick-dest-row {
      margin-top: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
      padding-top: 0.85rem;
      border-top: 1px solid #f1f5f9;
    }
    .quick-label {
      font-size: 0.78rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .quick-chips {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .quick-chip {
      background: #f1f5f9;
      color: #334155;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      border: 1px solid #e2e8f0;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .quick-chip:hover {
      background: #eff6ff;
      color: #2563eb;
      border-color: #bfdbfe;
    }
    .search-validation-error {
      margin-top: 0.85rem;
      color: #dc2626;
      font-size: 0.88rem;
      font-weight: 600;
      padding: 0.5rem 0.85rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
    }
    .featured-section {
      padding: 5rem 1.5rem;
      max-width: 1240px;
      margin: 0 auto;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .section-sub {
      color: #2563eb;
      font-size: 0.82rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      display: block;
      margin-bottom: 0.35rem;
    }
    .section-title {
      font-size: 2.2rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.025em;
    }
    .link-view-all {
      color: #2563eb;
      font-weight: 700;
      text-decoration: none;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.9rem;
      border-radius: 8px;
      background: #eff6ff;
      border: 1px solid #dbeafe;
      transition: all 0.2s ease;
    }
    .link-view-all:hover {
      background: #dbeafe;
      color: #1d4ed8;
      transform: translateX(2px);
    }
    .hotels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
      gap: 2rem;
    }
    .error-banner {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 1.25rem 1.5rem;
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-retry {
      background: #991b1b;
      color: #ffffff;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    .why-us-section {
      background: #ffffff;
      padding: 5.5rem 1.5rem;
      border-top: 1px solid #e2e8f0;
    }
    .section-container {
      max-width: 1240px;
      margin: 0 auto;
    }
    .text-center {
      text-align: center;
    }
    .why-desc {
      color: #64748b;
      font-size: 1.08rem;
      max-width: 650px;
      margin: 0.75rem auto 3.25rem;
      line-height: 1.6;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2.2rem;
    }
    .feature-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 2.2rem 1.75rem;
      text-align: center;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .feature-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 30px rgba(10, 17, 40, 0.08);
      border-color: #cbd5e1;
    }
    .feature-icon-wrap {
      width: 64px;
      height: 64px;
      margin: 0 auto 1.35rem;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-blue {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
    }
    .icon-gold {
      background: #fffbeb;
      border: 1px solid #fde68a;
    }
    .icon-emerald {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
    }
    .icon-rose {
      background: #fff1f2;
      border: 1px solid #fecdd3;
    }
    .feature-icon {
      font-size: 1.85rem;
    }
    .feature-title {
      font-size: 1.18rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.65rem;
      letter-spacing: -0.01em;
    }
    .feature-text {
      color: #64748b;
      font-size: 0.92rem;
      line-height: 1.6;
      margin: 0;
    }
    @media (max-width: 900px) {
      .hero-title {
        font-size: 2.4rem;
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

  setDestination(city: string): void {
    this.searchForm.patchValue({ location: city });
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
