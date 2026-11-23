import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Hotel } from '../../models/hotel.model';

@Component({
  selector: 'app-hotel-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="hotel-card">
      <div class="card-image-wrap">
        <img [src]="hotel.imageUrl" [alt]="hotel.name" class="hotel-img" loading="lazy" (error)="onImageError($event)">
        <div class="location-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          {{ hotel.location }}
        </div>
      </div>

      <div class="card-content">
        <div class="card-header">
          <h3 class="hotel-name">{{ hotel.name }}</h3>
          <div class="rating-badge">★ 4.8</div>
        </div>

        <p class="hotel-desc">{{ hotel.description }}</p>

        <div class="amenities-container" *ngIf="amenityList.length">
          <span *ngFor="let item of amenityList" class="amenity-pill">{{ item }}</span>
        </div>

        <div class="card-footer">
          <div class="price-section">
            <span class="price-label">Starting from</span>
            <div class="price-val">
              <span class="currency">₹</span>{{ hotel.roomType?.pricePerNight | number:'1.0-0' }}
              <span class="per-night">/ night</span>
            </div>
            <span class="rooms-badge" *ngIf="hotel.roomType">
              {{ hotel.roomType.totalRooms }} rooms capacity
            </span>
          </div>

          <a [routerLink]="['/hotels', hotel.id]" 
             [queryParams]="queryParams"
             class="btn-view-details">
            View Details
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hotel-card {
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 14px rgba(15, 41, 66, 0.08);
      border: 1px solid #e2e8f0;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .hotel-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 24px rgba(15, 41, 66, 0.14);
    }
    .card-image-wrap {
      position: relative;
      width: 100%;
      height: 220px;
      overflow: hidden;
      background-color: #f1f5f9;
    }
    .hotel-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
    .hotel-card:hover .hotel-img {
      transform: scale(1.05);
    }
    .location-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(15, 41, 66, 0.82);
      backdrop-filter: blur(4px);
      color: #ffffff;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.35rem 0.65rem;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .card-content {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }
    .hotel-name {
      font-size: 1.2rem;
      font-weight: 700;
      color: #0f2942;
      margin: 0;
      line-height: 1.3;
    }
    .rating-badge {
      background: #003580;
      color: #ffffff;
      font-weight: 700;
      font-size: 0.8rem;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      white-space: nowrap;
    }
    .hotel-desc {
      color: #64748b;
      font-size: 0.88rem;
      line-height: 1.5;
      margin: 0 0 1rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .amenities-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-bottom: 1.25rem;
    }
    .amenity-pill {
      background: #f1f5f9;
      color: #334155;
      font-size: 0.76rem;
      font-weight: 500;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }
    .card-footer {
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .price-section {
      display: flex;
      flex-direction: column;
    }
    .price-label {
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .price-val {
      font-size: 1.35rem;
      font-weight: 800;
      color: #003580;
      display: flex;
      align-items: baseline;
    }
    .currency {
      font-size: 1rem;
      margin-right: 2px;
    }
    .per-night {
      font-size: 0.8rem;
      font-weight: 400;
      color: #64748b;
      margin-left: 4px;
    }
    .rooms-badge {
      font-size: 0.75rem;
      color: #059669;
      font-weight: 600;
      margin-top: 2px;
    }
    .btn-view-details {
      background: #006ce4;
      color: #ffffff;
      padding: 0.65rem 1rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: background 0.2s, transform 0.15s;
      white-space: nowrap;
    }
    .btn-view-details:hover {
      background: #0056b3;
      transform: translateX(2px);
    }
  `]
})
export class HotelCardComponent {
  @Input({ required: true }) hotel!: Hotel;
  @Input() queryParams: any = {};

  get amenityList(): string[] {
    if (!this.hotel?.roomType?.amenities) return [];
    return this.hotel.roomType.amenities.split(',').slice(0, 3).map(s => s.trim());
  }

  onImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
  }
}
