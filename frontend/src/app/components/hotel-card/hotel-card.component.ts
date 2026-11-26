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
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          {{ hotel.location }}
        </div>
        <div class="rating-badge">
          <span class="star-icon">★</span> 4.9
        </div>
      </div>

      <div class="card-content">
        <div class="card-header">
          <h3 class="hotel-name">{{ hotel.name }}</h3>
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
              ● {{ hotel.roomType.totalRooms }} rooms capacity
            </span>
          </div>

          <a [routerLink]="['/hotels', hotel.id]" 
             [queryParams]="queryParams"
             class="btn-view-details">
            <span>View Details</span>
            <svg class="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
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
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(10, 17, 40, 0.06);
      border: 1px solid #e2e8f0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
    }
    .hotel-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 32px rgba(10, 17, 40, 0.12);
      border-color: #cbd5e1;
    }
    .card-image-wrap {
      position: relative;
      width: 100%;
      height: 220px;
      overflow: hidden;
      background-color: #0a1128;
    }
    .hotel-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .hotel-card:hover .hotel-img {
      transform: scale(1.07);
    }
    .location-badge {
      position: absolute;
      top: 14px;
      left: 14px;
      background: rgba(6, 12, 29, 0.78);
      backdrop-filter: blur(8px);
      color: #ffffff;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    .rating-badge {
      position: absolute;
      top: 14px;
      right: 14px;
      background: rgba(6, 12, 29, 0.78);
      backdrop-filter: blur(8px);
      color: #ffffff;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 0.35rem 0.65rem;
      border-radius: 9999px;
      border: 1px solid rgba(245, 158, 11, 0.3);
      display: flex;
      align-items: center;
      gap: 0.3rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    .star-icon {
      color: #f59e0b;
      font-size: 0.85rem;
    }
    .card-content {
      padding: 1.35rem;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    .card-header {
      margin-bottom: 0.5rem;
    }
    .hotel-name {
      font-size: 1.22rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      line-height: 1.3;
      letter-spacing: -0.015em;
    }
    .hotel-desc {
      color: #64748b;
      font-size: 0.88rem;
      line-height: 1.55;
      margin: 0 0 1.1rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .amenities-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
      margin-bottom: 1.35rem;
    }
    .amenity-pill {
      background: #eff6ff;
      color: #1d4ed8;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      border: 1px solid #dbeafe;
    }
    .card-footer {
      margin-top: auto;
      padding-top: 1.1rem;
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
      font-size: 0.72rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
    .price-val {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: baseline;
      line-height: 1.15;
    }
    .currency {
      font-size: 1rem;
      color: #1d4ed8;
      margin-right: 2px;
      font-weight: 700;
    }
    .per-night {
      font-size: 0.8rem;
      font-weight: 500;
      color: #64748b;
      margin-left: 4px;
    }
    .rooms-badge {
      font-size: 0.75rem;
      color: #059669;
      font-weight: 600;
      margin-top: 3px;
    }
    .btn-view-details {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      padding: 0.65rem 1.1rem;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.45rem;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
      transition: all 0.25s ease;
      white-space: nowrap;
    }
    .btn-view-details:hover {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
      transform: translateY(-1px);
    }
    .arrow-icon {
      transition: transform 0.2s ease;
    }
    .btn-view-details:hover .arrow-icon {
      transform: translateX(3px);
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
