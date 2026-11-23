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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
            </svg>
          </div>
          <span class="brand-name">Hotel<strong>Booking</strong></span>
        </a>

        <button class="mobile-toggle" (click)="toggleMenu()" aria-label="Toggle navigation">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>

        <nav class="nav-links" [class.open]="menuOpen">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMenu()">Home</a>
          <a routerLink="/hotels" routerLinkActive="active" (click)="closeMenu()">Explore Hotels</a>
          <a routerLink="/my-bookings" routerLinkActive="active" (click)="closeMenu()" class="my-bookings-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
      background-color: #003580;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0.9rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      color: #ffffff;
      text-decoration: none;
      font-size: 1.35rem;
      letter-spacing: -0.3px;
    }
    .logo-icon {
      background: #006ce4;
      color: #ffffff;
      padding: 6px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-name {
      font-weight: 500;
    }
    .brand-name strong {
      color: #79b5ff;
      font-weight: 700;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.8rem;
    }
    .nav-links a {
      color: #e2eeff;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.95rem;
      padding: 0.4rem 0.6rem;
      border-radius: 4px;
      transition: color 0.2s, background-color 0.2s;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .nav-links a:hover {
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.12);
    }
    .nav-links a.active {
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.2);
      font-weight: 600;
    }
    .my-bookings-link {
      background-color: #006ce4;
      color: #ffffff !important;
      padding: 0.45rem 0.9rem !important;
      border-radius: 6px !important;
    }
    .my-bookings-link:hover {
      background-color: #0056b3 !important;
    }
    .mobile-toggle {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      flex-direction: column;
      gap: 5px;
    }
    .mobile-toggle .bar {
      width: 24px;
      height: 2.5px;
      background-color: #ffffff;
      border-radius: 2px;
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
        background-color: #003580;
        flex-direction: column;
        padding: 1.2rem;
        gap: 0.8rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
      .nav-links.open {
        display: flex;
      }
      .nav-links a {
        width: 100%;
        padding: 0.7rem 1rem;
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
