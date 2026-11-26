import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar-wrapper">
      <div class="nav-container">
        <a routerLink="/" class="brand-logo">
          <div class="logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
            </svg>
          </div>
          <div class="brand-text-wrap">
            <span class="brand-name">Hotel<strong>Booking</strong></span>
            <span class="brand-tagline">LUXURY COLLECTION</span>
          </div>
        </a>

        <button class="mobile-toggle" (click)="toggleMenu()" aria-label="Toggle navigation">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>

        <nav class="nav-links" [class.open]="menuOpen">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMenu()">Home</a>
          <a routerLink="/hotels" routerLinkActive="active" (click)="closeMenu()">Explore Stays</a>
          <a routerLink="/my-bookings" routerLinkActive="active" (click)="closeMenu()" class="my-bookings-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            My Bookings
          </a>
          <a routerLink="/" fragment="about" (click)="closeMenu()">About</a>
          <a routerLink="/" fragment="contact" (click)="closeMenu()">Contact</a>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .navbar-wrapper {
      background: linear-gradient(180deg, #060c1d 0%, #0a1128 100%);
      color: #ffffff;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 4px 20px rgba(6, 12, 29, 0.35);
      position: sticky;
      top: 0;
      z-index: 1000;
      backdrop-filter: blur(12px);
    }
    .nav-container {
      max-width: 1240px;
      margin: 0 auto;
      padding: 0.85rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #ffffff;
      text-decoration: none;
      transition: transform 0.2s ease;
    }
    .brand-logo:hover {
      transform: translateY(-1px);
    }
    .logo-icon {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      padding: 8px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 10px rgba(37, 99, 235, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .brand-text-wrap {
      display: flex;
      flex-direction: column;
    }
    .brand-name {
      font-size: 1.25rem;
      font-weight: 500;
      letter-spacing: -0.02em;
      line-height: 1.1;
    }
    .brand-name strong {
      color: #60a5fa;
      font-weight: 700;
    }
    .brand-tagline {
      font-size: 0.62rem;
      letter-spacing: 0.14em;
      color: #f59e0b;
      font-weight: 700;
      margin-top: 2px;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .nav-links a {
      color: #cbd5e1;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.92rem;
      padding: 0.45rem 0.8rem;
      border-radius: 8px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }
    .nav-links a:hover {
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.08);
    }
    .nav-links a.active {
      color: #ffffff;
      background-color: rgba(37, 99, 235, 0.25);
      border: 1px solid rgba(96, 165, 250, 0.3);
      font-weight: 600;
    }
    .my-bookings-btn {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
      color: #ffffff !important;
      padding: 0.5rem 1.1rem !important;
      border-radius: 9999px !important;
      font-weight: 600 !important;
      box-shadow: 0 2px 10px rgba(37, 99, 235, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      transition: all 0.25s ease !important;
    }
    .my-bookings-btn:hover {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%) !important;
      box-shadow: 0 4px 16px rgba(37, 99, 235, 0.5);
      transform: translateY(-1px);
    }
    .mobile-toggle {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      flex-direction: column;
      gap: 5px;
      padding: 6px;
    }
    .mobile-toggle .bar {
      width: 24px;
      height: 2px;
      background-color: #ffffff;
      border-radius: 2px;
      transition: 0.2s ease;
    }
    @media (max-width: 768px) {
      .mobile-toggle {
        display: flex;
      }
      .nav-links {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: #0a1128;
        flex-direction: column;
        padding: 1.25rem;
        gap: 0.8rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
      }
      .nav-links.open {
        display: flex;
      }
      .nav-links a {
        width: 100%;
        padding: 0.75rem 1rem;
      }
    }
  `]
})
export class NavbarComponent {
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }
}
