import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer-wrapper">
      <div class="footer-container">
        <div class="footer-col about" id="about">
          <div class="footer-brand">
            <span class="brand-text">Hotel<strong>Booking</strong></span>
            <span class="brand-gold-tag">LUXURY COLLECTION</span>
          </div>
          <p class="about-desc">
            Your trusted portal for discovering hand-picked palace hotels, beachfront villas, 
            and mountain sanctuaries. We make booking seamless, secure, and transparent with 
            verified room availability and instant confirmations.
          </p>
          <div class="tech-badge">
            Full-Stack Spring Boot 3 + Angular 19 + MySQL
          </div>
        </div>

        <div class="footer-col links">
          <h4 class="col-title">Luxury Destinations</h4>
          <ul>
            <li><a routerLink="/hotels" [queryParams]="{location: 'Udaipur'}">Palaces in Udaipur</a></li>
            <li><a routerLink="/hotels" [queryParams]="{location: 'Goa'}">Beach Resorts in Goa</a></li>
            <li><a routerLink="/hotels" [queryParams]="{location: 'Mumbai'}">Luxury Towers in Mumbai</a></li>
            <li><a routerLink="/hotels" [queryParams]="{location: 'Manali'}">Himalayan Retreats in Manali</a></li>
            <li><a routerLink="/hotels">Explore All Properties</a></li>
          </ul>
        </div>

        <div class="footer-col contact" id="contact">
          <h4 class="col-title">Concierge &amp; Support</h4>
          <ul class="contact-list">
            <li>
              <span class="icon">📍</span>
              <span>The Oberoi &amp; Taj Heritage District, Mumbai 400021</span>
            </li>
            <li>
              <span class="icon">✉️</span>
              <span>concierge&#64;hotelbookingportal.com</span>
            </li>
            <li>
              <span class="icon">📞</span>
              <span>+91 22 4500 8800 (24x7 Luxury Helpline)</span>
            </li>
            <li>
              <span class="icon">🛡️</span>
              <span>256-Bit SSL Encrypted &amp; OWASP Hardened</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="bottom-container">
          <p>&copy; 2026 Hotel Booking Portal. All rights reserved.</p>
          <p class="privacy-note">Guaranteed Live Availability | Verified Guest Reviews | Secure Checkout</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-wrapper {
      background: linear-gradient(180deg, #0a1128 0%, #060c1d 100%);
      color: #94a3b8;
      padding-top: 3.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      position: relative;
    }
    .footer-wrapper::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #2563eb, #f59e0b, transparent);
    }
    .footer-container {
      max-width: 1240px;
      margin: 0 auto;
      padding: 0 1.5rem 3rem;
      display: grid;
      grid-template-columns: 2fr 1.2fr 1.5fr;
      gap: 3.5rem;
    }
    .footer-brand {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .footer-brand .brand-text {
      font-size: 1.4rem;
      color: #ffffff;
      font-weight: 600;
      letter-spacing: -0.02em;
    }
    .footer-brand strong {
      color: #60a5fa;
    }
    .brand-gold-tag {
      font-size: 0.65rem;
      letter-spacing: 0.12em;
      color: #f59e0b;
      font-weight: 700;
    }
    .about-desc {
      margin-top: 1rem;
      line-height: 1.65;
      font-size: 0.92rem;
      color: #94a3b8;
    }
    .tech-badge {
      display: inline-block;
      margin-top: 1.2rem;
      background: rgba(37, 99, 235, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.3);
      color: #93c5fd;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    .col-title {
      color: #ffffff;
      font-size: 1.05rem;
      margin-bottom: 1.2rem;
      font-weight: 600;
      position: relative;
      padding-bottom: 0.6rem;
    }
    .col-title::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 28px;
      height: 2px;
      background: #2563eb;
      border-radius: 2px;
    }
    .links ul, .contact-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .links li {
      margin-bottom: 0.75rem;
    }
    .links a {
      color: #cbd5e1;
      text-decoration: none;
      font-size: 0.92rem;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
    }
    .links a:hover {
      color: #ffffff;
      transform: translateX(4px);
    }
    .contact-list li {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 0.85rem;
      font-size: 0.9rem;
      color: #cbd5e1;
      align-items: flex-start;
      line-height: 1.45;
    }
    .contact-list .icon {
      font-size: 1rem;
      flex-shrink: 0;
    }
    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      background-color: #060c1d;
      padding: 1.25rem 1.5rem;
      font-size: 0.85rem;
      color: #64748b;
    }
    .bottom-container {
      max-width: 1240px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    @media (max-width: 900px) {
      .footer-container {
        grid-template-columns: 1fr;
        gap: 2.5rem;
      }
      .bottom-container {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {}
