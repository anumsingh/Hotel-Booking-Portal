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
            <span class="brand-text">Hotel<strong>Booking</strong> Portal</span>
          </div>
          <p class="about-desc">
            Your premier platform for discovering hand-picked luxury hotels and tranquil stays. 
            We make booking seamless, secure, and completely transparent with verified hotel details 
            and instant confirmations.
          </p>
          <div class="tech-badge">
            Full-Stack Spring Boot 3 + Angular 17 + MySQL
          </div>
        </div>

        <div class="footer-col links">
          <h4 class="col-title">Quick Links</h4>
          <ul>
            <li><a routerLink="/">Home</a></li>
            <li><a routerLink="/hotels">Explore All Hotels</a></li>
            <li><a routerLink="/my-bookings">Retrieve Booking</a></li>
            <li><a routerLink="/hotels" [queryParams]="{location: 'Mumbai'}">Hotels in Mumbai</a></li>
            <li><a routerLink="/hotels" [queryParams]="{location: 'Goa'}">Resorts in Goa</a></li>
          </ul>
        </div>

        <div class="footer-col contact" id="contact">
          <h4 class="col-title">Contact & Support</h4>
          <ul class="contact-list">
            <li>
              <span class="icon">📍</span>
              <span>100 Marine Drive, Nariman Point, Mumbai 400021</span>
            </li>
            <li>
              <span class="icon">✉️</span>
              <span>support&#64;hotelbookingportal.com</span>
            </li>
            <li>
              <span class="icon">📞</span>
              <span>+91 22 4500 8800 (24x7 Guest Helpline)</span>
            </li>
            <li>
              <span class="icon">🕒</span>
              <span>Mon - Sun: 24 Hours Availability</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="bottom-container">
          <p>&copy; 2026 Hotel Booking Portal. All rights reserved.</p>
          <p class="privacy-note">Secure SSL 256-Bit Encrypted Transactions | Guaranteed Availability</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-wrapper {
      background-color: #0f2942;
      color: #cbd5e1;
      padding-top: 3.5rem;
      border-top: 3px solid #006ce4;
    }
    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem 3rem;
      display: grid;
      grid-template-columns: 2fr 1fr 1.5fr;
      gap: 3rem;
    }
    .footer-brand .brand-text {
      font-size: 1.4rem;
      color: #ffffff;
      font-weight: 600;
    }
    .footer-brand strong {
      color: #006ce4;
    }
    .about-desc {
      margin-top: 1rem;
      line-height: 1.6;
      font-size: 0.92rem;
      color: #94a3b8;
    }
    .tech-badge {
      display: inline-block;
      margin-top: 1.2rem;
      background: rgba(0, 108, 228, 0.15);
      border: 1px solid rgba(0, 108, 228, 0.4);
      color: #79b5ff;
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    .col-title {
      color: #ffffff;
      font-size: 1.1rem;
      margin-bottom: 1.2rem;
      font-weight: 600;
      position: relative;
      padding-bottom: 0.5rem;
    }
    .col-title::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 32px;
      height: 2px;
      background-color: #006ce4;
      border-radius: 2px;
    }
    .links ul, .contact-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .links li {
      margin-bottom: 0.65rem;
    }
    .links a {
      color: #cbd5e1;
      text-decoration: none;
      font-size: 0.92rem;
      transition: color 0.2s, transform 0.2s;
      display: inline-block;
    }
    .links a:hover {
      color: #ffffff;
      transform: translateX(4px);
    }
    .contact-list li {
      display: flex;
      gap: 0.6rem;
      margin-bottom: 0.8rem;
      font-size: 0.9rem;
      color: #cbd5e1;
      line-height: 1.4;
    }
    .footer-bottom {
      background-color: #081a2b;
      padding: 1.2rem 1.5rem;
      font-size: 0.85rem;
      color: #64748b;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    .bottom-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.8rem;
    }
    @media (max-width: 850px) {
      .footer-container {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      .bottom-container {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {}
