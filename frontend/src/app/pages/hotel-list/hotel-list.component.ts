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
            <h1 class="page-title">Explore Hotels &amp; Resorts</h1>
            <p class="summary-sub" *ngIf="selectedLocation">
              Showing hotels matching <strong>"{{ selectedLocation }}"</strong>
              <span *ngIf="checkIn && checkOut"> for {{ checkIn }} to {{ checkOut }}</span>
            </p>
            <p class="summary-sub" *ngIf="!selectedLocation">
              Browse all verified luxury stays
              <span *ngIf="checkIn && checkOut"> for {{ checkIn }} to {{ checkOut }}</span>
            </p>
          </div>
          <div class="results-count" *ngIf="!loading">
            <strong>{{ filteredHotels.length }}</strong> hotels available
          </div>
        </div>

        <div class="content-layout">
          <!-- FILTERS SIDEBAR -->
          <aside class="filters-sidebar">
            <div class="filter-card">
              <div class="filter-header">
                <h3>Filter Results</h3>
                <button (click)="resetFilters()" class="btn-reset">Reset</button>
              </div>

              <!-- Location Filter -->
              <div class="filter-section">
                <label class="filter-label">Destination Location</label>
                <div class="input-wrap">
                  <input 
                    type="text" 
                    [(ngModel)]="filterLocation" 
                    (input)="applyFilters()" 
                    placeholder="Search by city (e.g. Mumbai)"
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
                  [min]="2000" 
                  [max]="10000" 
                  [step]="500" 
                  [(ngModel)]="maxPrice" 
                  (input)="applyFilters()"
                  class="range-slider"
                />
                <div class="range-marks">
                  <span>₹2,000</span>
                  <span>₹10,000</span>
                </div>
              </div>

              <!-- Amenities Filter -->
              <div class="filter-section">
                <label class="filter-label">Popular Amenities</label>
                <div class="checkbox-group">
                  <label *ngFor="let amenity of availableAmenities" class="checkbox-label">
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
              <div class="empty-icon">🏨</div>
              <h3>No Hotels Found</h3>
              <p>We couldn't find any hotels matching your current filter criteria.</p>
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
      padding: 2rem 1.5rem 4rem;
    }
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .search-summary-banner {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      box-shadow: 0 2px 8px rgba(15, 41, 66, 0.05);
    }
    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f2942;
      margin: 0 0 0.25rem;
    }
    .summary-sub {
      color: #64748b;
      font-size: 0.95rem;
      margin: 0;
    }
    .results-count {
      background: #ebf3ff;
      color: #006ce4;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .content-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 2rem;
      align-items: flex-start;
    }
    .filter-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(15, 41, 66, 0.05);
      position: sticky;
      top: 90px;
    }
    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #f1f5f9;
    }
    .filter-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f2942;
    }
    .btn-reset {
      background: none;
      border: none;
      color: #006ce4;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
    }
    .filter-section {
      margin-bottom: 1.5rem;
    }
    .filter-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.5rem;
      display: block;
    }
    .filter-input {
      width: 100%;
      padding: 0.65rem 0.8rem;
      border: 1.5px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.9rem;
      box-sizing: border-box;
    }
    .filter-input:focus {
      outline: none;
      border-color: #006ce4;
    }
    .price-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .price-val {
      font-weight: 700;
      color: #003580;
      font-size: 0.9rem;
    }
    .range-slider {
      width: 100%;
      accent-color: #006ce4;
      margin: 0.5rem 0 0.25rem;
    }
    .range-marks {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.88rem;
      color: #475569;
      cursor: pointer;
    }
    .checkbox-label input {
      accent-color: #006ce4;
      cursor: pointer;
    }
    .hotels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.8rem;
    }
    .empty-state {
      background: #ffffff;
      border: 1px dashed #cbd5e1;
      border-radius: 12px;
      padding: 4rem 2rem;
      text-align: center;
    }
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    .empty-state h3 {
      font-size: 1.3rem;
      color: #0f2942;
      margin: 0 0 0.5rem;
    }
    .empty-state p {
      color: #64748b;
      margin: 0 0 1.5rem;
    }
    .btn-clear-filters {
      background: #006ce4;
      color: #ffffff;
      border: none;
      padding: 0.65rem 1.25rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }
    .error-box {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 1.5rem;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-retry {
      background: #991b1b;
      color: #ffffff;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
    }
    @media (max-width: 850px) {
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
  maxPrice = 10000;
  selectedAmenities: string[] = [];

  availableAmenities: string[] = [
    'Wi-Fi',
    'Pool',
    'Breakfast',
    'Beach',
    'Mountain View',
    'Spa',
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
    this.maxPrice = 10000;
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
