import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HotelService } from '../../services/hotel.service';
import { Hotel } from '../../models/hotel.model';
import { HotelCardComponent } from '../../components/hotel-card/hotel-card.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-hotel-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HotelCardComponent, LoadingSpinnerComponent],
  template: `
    <div class="hotel-list-page">
      <div class="page-container">
        <!-- TOP SEARCH BAR -->
        <div class="search-summary-banner">
          <div class="summary-info">
            <span class="eyebrow">Luxury Accommodations</span>
            <h1 class="page-title">Explore Verified Stays &amp; Resorts</h1>
            <p class="summary-sub" *ngIf="selectedLocation">
              Showing premium stays matching <strong>"{{ selectedLocation }}"</strong>
              <span *ngIf="checkIn && checkOut" class="dates-tag"> ({{ checkIn }} → {{ checkOut }})</span>
            </p>
            <p class="summary-sub" *ngIf="!selectedLocation">
              Browse our curated portfolio of heritage palaces, beachfront villas &amp; mountain chalets
              <span *ngIf="checkIn && checkOut" class="dates-tag"> ({{ checkIn }} → {{ checkOut }})</span>
            </p>
          </div>
          <div class="results-count" *ngIf="!loading">
            <strong>{{ filteredHotels.length }}</strong> Properties Available
          </div>
        </div>

        <div class="content-layout">
          <!-- FILTERS SIDEBAR -->
          <aside class="filters-sidebar">
            <div class="filter-card">
              <div class="filter-header">
                <h3>Filter Results</h3>
                <button (click)="resetFilters()" class="btn-reset">Reset All</button>
              </div>

              <!-- Location Filter -->
              <div class="filter-section">
                <label class="filter-label">Destination Location</label>
                <div class="input-wrap">
                  <input 
                    type="text" 
                    [(ngModel)]="filterLocation" 
                    (input)="applyFilters()" 
                    placeholder="Filter by city (e.g. Udaipur, Goa)"
                    class="filter-input"
                  />
                </div>
              </div>

              <!-- Price Range Filter -->
              <div class="filter-section">
                <div class="price-header">
                  <label class="filter-label">Max Price / Night</label>
                  <span class="price-val">₹{{ maxPrice | number:'1.0-0' }}</span>
                </div>
                <input 
                  type="range" 
                  [min]="3000" 
                  [max]="15000" 
                  [step]="500" 
                  [(ngModel)]="maxPrice" 
                  (input)="applyFilters()"
                  class="range-slider"
                />
                <div class="range-marks">
                  <span>₹3,000</span>
                  <span>₹15,000</span>
                </div>
              </div>

              <!-- Amenities Filter -->
              <div class="filter-section">
                <label class="filter-label">Popular Amenities</label>
                <div class="checkbox-group">
                  <label *ngFor="let amenity of availableAmenities" class="checkbox-label" [class.checked]="selectedAmenities.includes(amenity)">
                    <input 
                      type="checkbox" 
                      [value]="amenity" 
                      [checked]="selectedAmenities.includes(amenity)"
                      (change)="toggleAmenity(amenity)"
                    />
                    <span>{{ amenity }}</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          <!-- MAIN RESULTS LIST -->
          <main class="results-main">
            <!-- Loading -->
            <app-loading-spinner *ngIf="loading" message="Fetching hotels from Spring Boot backend..."></app-loading-spinner>

            <!-- Error Banner -->
            <div *ngIf="errorMessage && !loading" class="error-box">
              <p>{{ errorMessage }}</p>
              <button (click)="fetchHotels()" class="btn-retry">Retry Search</button>
            </div>

            <!-- Empty State -->
            <div *ngIf="!loading && !errorMessage && filteredHotels.length === 0" class="empty-state">
              <div class="empty-icon">🏰</div>
              <h3>No Properties Found</h3>
              <p>We couldn't find any stays matching your current filter criteria.</p>
              <button (click)="resetFilters()" class="btn-clear-filters">Clear All Filters</button>
            </div>

            <!-- Hotel Cards Grid -->
            <div *ngIf="!loading && !errorMessage && filteredHotels.length > 0" class="hotels-grid">
              <app-hotel-card 
                *ngFor="let hotel of filteredHotels" 
                [hotel]="hotel" 
                [queryParams]="getQueryParams()">
              </app-hotel-card>
            </div>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hotel-list-page {
      background-color: #f8fafc;
      min-height: calc(100vh - 70px);
      padding: 2.5rem 1.5rem 5rem;
    }
    .page-container {
      max-width: 1240px;
      margin: 0 auto;
    }
    .search-summary-banner {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.75rem 2rem;
      margin-bottom: 2.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.25rem;
      box-shadow: 0 4px 20px rgba(10, 17, 40, 0.05);
    }
    .eyebrow {
      font-size: 0.78rem;
      color: #2563eb;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      display: block;
      margin-bottom: 0.25rem;
    }
    .page-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.35rem;
      letter-spacing: -0.02em;
    }
    .summary-sub {
      color: #64748b;
      font-size: 0.95rem;
      margin: 0;
    }
    .dates-tag {
      color: #2563eb;
      font-weight: 600;
    }
    .results-count {
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #dbeafe;
      padding: 0.55rem 1.2rem;
      border-radius: 9999px;
      font-size: 0.88rem;
      font-weight: 600;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.08);
    }
    .content-layout {
      display: grid;
      grid-template-columns: 290px 1fr;
      gap: 2.2rem;
      align-items: flex-start;
    }
    .filter-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.6rem;
      box-shadow: 0 4px 18px rgba(10, 17, 40, 0.05);
      position: sticky;
      top: 90px;
    }
    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 0.85rem;
      border-bottom: 1px solid #f1f5f9;
    }
    .filter-header h3 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
    }
    .btn-reset {
      background: none;
      border: none;
      color: #2563eb;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: color 0.2s;
    }
    .btn-reset:hover {
      color: #1d4ed8;
      text-decoration: underline;
    }
    .filter-section {
      margin-bottom: 1.6rem;
    }
    .filter-label {
      font-size: 0.84rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.5rem;
      display: block;
    }
    .filter-input {
      width: 100%;
      padding: 0.75rem 0.9rem;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.9rem;
      box-sizing: border-box;
      font-family: inherit;
      background: #f8fafc;
      transition: all 0.2s;
    }
    .filter-input:focus {
      outline: none;
      border-color: #2563eb;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }
    .price-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .price-val {
      font-weight: 800;
      color: #1d4ed8;
      font-size: 0.95rem;
    }
    .range-slider {
      width: 100%;
      accent-color: #2563eb;
      margin: 0.6rem 0 0.35rem;
      cursor: pointer;
    }
    .range-marks {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: 500;
    }
    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.88rem;
      color: #475569;
      cursor: pointer;
      padding: 0.35rem 0.5rem;
      border-radius: 6px;
      transition: background 0.15s;
    }
    .checkbox-label:hover {
      background: #f1f5f9;
    }
    .checkbox-label.checked {
      color: #1d4ed8;
      font-weight: 600;
      background: #eff6ff;
    }
    .checkbox-label input {
      accent-color: #2563eb;
      cursor: pointer;
      width: 16px;
      height: 16px;
    }
    .hotels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
    }
    .empty-state {
      background: #ffffff;
      border: 2px dashed #cbd5e1;
      border-radius: 16px;
      padding: 4.5rem 2rem;
      text-align: center;
    }
    .empty-icon {
      font-size: 3.2rem;
      margin-bottom: 1.2rem;
    }
    .empty-state h3 {
      font-size: 1.35rem;
      color: #0f172a;
      margin: 0 0 0.6rem;
      font-weight: 700;
    }
    .empty-state p {
      color: #64748b;
      margin: 0 0 1.6rem;
      font-size: 0.95rem;
    }
    .btn-clear-filters {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.92rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      transition: all 0.2s;
    }
    .btn-clear-filters:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
    }
    .error-box {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 1.5rem;
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
      cursor: pointer;
      font-weight: 600;
    }
    @media (max-width: 880px) {
      .content-layout {
        grid-template-columns: 1fr;
      }
      .filter-card {
        position: static;
      }
    }
  `]
})
export class HotelListComponent implements OnInit {
  hotels: Hotel[] = [];
  filteredHotels: Hotel[] = [];
  loading = true;
  errorMessage = '';

  selectedLocation = '';
  checkIn = '';
  checkOut = '';

  filterLocation = '';
  maxPrice = 12000;
  selectedAmenities: string[] = [];

  availableAmenities: string[] = [
    'Wi-Fi',
    'Pool',
    'Spa',
    'Dining',
    'Balcony',
    'Butler',
    'Parking'
  ];

  constructor(
    private hotelService: HotelService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedLocation = params['location'] || '';
      this.filterLocation = this.selectedLocation;
      this.checkIn = params['checkIn'] || '';
      this.checkOut = params['checkOut'] || '';
      this.fetchHotels();
    });
  }

  fetchHotels(): void {
    this.loading = true;
    this.errorMessage = '';

    const apiCall = this.selectedLocation
      ? this.hotelService.searchHotels(this.selectedLocation)
      : this.hotelService.getAllHotels();

    apiCall.subscribe({
      next: (data) => {
        this.hotels = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load hotels from server. Please verify backend is running.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredHotels = this.hotels.filter(hotel => {
      // Location filter
      if (this.filterLocation && this.filterLocation.trim()) {
        const query = this.filterLocation.toLowerCase().trim();
        const matchesLoc = hotel.location.toLowerCase().includes(query) || hotel.name.toLowerCase().includes(query);
        if (!matchesLoc) return false;
      }

      // Max price filter
      if (hotel.roomType && hotel.roomType.pricePerNight > this.maxPrice) {
        return false;
      }

      // Amenities filter
      if (this.selectedAmenities.length > 0) {
        const hotelAmenities = (hotel.roomType?.amenities || '').toLowerCase();
        const hasAllAmenities = this.selectedAmenities.every(a => hotelAmenities.includes(a.toLowerCase()));
        if (!hasAllAmenities) return false;
      }

      return true;
    });
  }

  toggleAmenity(amenity: string): void {
    if (this.selectedAmenities.includes(amenity)) {
      this.selectedAmenities = this.selectedAmenities.filter(a => a !== amenity);
    } else {
      this.selectedAmenities.push(amenity);
    }
    this.applyFilters();
  }

  resetFilters(): void {
    this.filterLocation = '';
    this.maxPrice = 12000;
    this.selectedAmenities = [];
    this.applyFilters();
  }

  getQueryParams(): any {
    const params: any = {};
    if (this.checkIn) params.checkIn = this.checkIn;
    if (this.checkOut) params.checkOut = this.checkOut;
    return params;
  }
}
