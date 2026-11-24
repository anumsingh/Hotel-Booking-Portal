# Security Audit & Hardening Report

**Application**: Hotel Booking Portal  
**Architecture**: Angular 17 Frontend, Java Spring Boot 3.3.5 Backend, MySQL 8.0 Relational Database  
**Audit Date**: November 2026  
**Status**: REMEDIATED & VERIFIED  

---

## 1. Executive Summary

A comprehensive security audit of the **Hotel Booking Portal** was conducted following OWASP Top 10 standards and secure software development lifecycles (SSDLC). Multiple security vulnerabilities were identified in the original implementation, including **Critical** exposure of guest credentials and booking references in URLs, **High** risks of IDOR (Insecure Direct Object Reference) and unauthorized booking cancellation, missing rate limiting, missing HTTP security headers, and overly permissive CORS configurations.

All identified vulnerabilities have been remediated across the application tiers without degrading functional features or breaking user workflows. The application was thoroughly validated with **34 automated backend JUnit 5/Mockito tests**, **21 Angular Karma/Jasmine tests in headless Chrome**, and a **10-step live integration verification suite**.

---

## 2. Vulnerability Classification & Findings

| Vulnerability ID | Vulnerability Title | Severity | OWASP Category | Remediation Status |
|---|---|---|---|---|
| **VULN-01** | Sensitive Booking Credentials & Email Exposed in URL Query Parameters | **CRITICAL** | A01:2021-Broken Access Control / CWE-598 | **FIXED** |
| **VULN-02** | Insecure Booking Retrieval & IDOR Information Leakage | **HIGH** | A01:2021-Broken Access Control / CWE-284 | **FIXED** |
| **VULN-03** | Insecure Reservation Cancellation Lacking Server Verification Session | **HIGH** | A07:2021-Identification & Authentication Failures | **FIXED** |
| **VULN-04** | Missing Rate Limiting on Sensitive Lookup & Cancellation Endpoints | **HIGH** | A04:2021-Insecure Design / CWE-307 | **FIXED** |
| **VULN-05** | Missing OWASP HTTP Security Headers & Sensitive Cache-Control | **MEDIUM** | A05:2021-Security Misconfiguration / CWE-16 | **FIXED** |
| **VULN-06** | Permissive CORS Configuration with Wildcard Request Headers | **MEDIUM** | A05:2021-Security Misconfiguration / CWE-346 | **FIXED** |
| **VULN-07** | Internal Database Primary Key (`id`) Leaked in Public API Responses | **MEDIUM** | A01:2021-Broken Access Control / CWE-200 | **FIXED** |
| **VULN-08** | Application Running with Full Database `root` Administrative Privileges | **MEDIUM** | A05:2021-Security Misconfiguration / CWE-250 | **FIXED** |
| **VULN-09** | Potential User Enumeration via Verbose Mismatch Error Messages | **MEDIUM** | A05:2021-Security Misconfiguration / CWE-209 | **FIXED** |
| **VULN-10** | Angular Route Parameter Exposure on Confirmation Page | **MEDIUM** | A01:2021-Broken Access Control / CWE-598 | **FIXED** |
| **VULN-11** | Pseudorandom Reference Generation without Cryptographic Randomness | **LOW** | A02:2021-Cryptographic Failures / CWE-338 | **FIXED** |
| **VULN-12** | Third-Party Frontend Dependencies Flagged in Build-Time Audit | **LOW** | A06:2021-Vulnerable and Outdated Components | **AUDITED / DOCUMENTED** |

---

## 3. Detailed Vulnerability Analysis & Remediations

### VULN-01: Sensitive Booking Credentials & Email Exposed in URL Query Parameters
- **Severity**: **CRITICAL** (CVSS 8.2)
- **Initial State**:
  The portal previously passed booking references and guest email addresses directly as URL query parameters:
  `http://localhost:4200/my-bookings?reference=THB-20261123-9C5108&email=anusingh@gmail.com`
  `http://localhost:4200/confirmation/THB-20261123-9C5108?email=anusingh@gmail.com`
  This caused sensitive authorization credentials and Personally Identifiable Information (PII) to be persisted in browser histories, proxy logs, web server access logs, and referrer headers.
- **Remediation**:
  1. **Frontend**: Clean route `/my-bookings` implemented. Removed all query-param population. Booking credentials are now collected solely via Angular Reactive Forms and submitted via HTTP POST in the request body.
  2. **Confirmation Route**: Switched route to `/confirmation` (clean URL). Data is transferred in-memory via Angular Router navigation state (`history.state.booking`). If refreshed or directly visited, a safe fallback prompts the user to enter their reference on `/my-bookings`.
  3. **Zero Browser Storage**: No sensitive booking data, email, or session tokens are stored in `localStorage` or `sessionStorage`.
  4. **Form Clearing**: Reactive form inputs and session tokens are cleared upon successful submission and component destruction.

---

### VULN-02 & VULN-07: Insecure Booking Retrieval, IDOR & Database ID Exposure
- **Severity**: **HIGH** (CVSS 7.5)
- **Initial State**:
  Retrieval previously relied on `GET /api/bookings/{reference}?email=...`. Mismatches returned verbose error messages such as `"No booking found matching reference 'X' and email 'Y'"`, facilitating credential enumeration. Public responses also exposed internal numeric database IDs (`id`, `hotelId`, `roomTypeId`).
- **Remediation**:
  1. Created secure endpoint `POST /api/bookings/lookup` accepting `{ "bookingReference": "...", "email": "..." }` in the request body.
  2. Created `BookingDataDto` which strictly strips internal surrogate database IDs (`id`, `hotelId`, `roomTypeId`), preventing database structure enumeration.
  3. Added strict regex validation on `bookingReference` (`^THB-\d{8}-[A-F0-9]{6}$`) and strict email format validation.
  4. Generic safe error response on mismatch: `"Unable to retrieve booking with the provided details."` (HTTP 404). Neither attacker nor automated scraper can discern whether an email exists independently of a booking reference.

---

### VULN-03: Insecure Reservation Cancellation & Lack of Session Authorization
- **Severity**: **HIGH** (CVSS 7.8)
- **Initial State**:
  Cancellations used `PUT /api/bookings/{reference}/cancel` with optional email in query parameters. Any party obtaining a booking reference and email could trigger instantaneous cancellation without an authenticated session.
- **Remediation**:
  1. Created `BookingVerificationService` managing server-side, cryptographically generated 256-bit verification tokens (`verificationToken`) valid for 15 minutes.
  2. When a guest verifies ownership via `POST /api/bookings/lookup`, a verification session token is issued and cached server-side.
  3. Created `POST /api/bookings/cancel` accepting `{ "bookingReference": "...", "email": "...", "verificationToken": "..." }`.
  4. Validates that the token exists, is not expired, and belongs to that exact reference and email.
  5. Implemented single-use invalidation: token is destroyed upon successful cancellation.
  6. Double-cancellation guard: rejects duplicate attempts with HTTP 400 (`"Booking is already cancelled."`).
  7. Room inventory is released transactionally within the same database transaction.

---

### VULN-04: Missing Rate Limiting on Sensitive Endpoints
- **Severity**: **HIGH** (CVSS 7.3)
- **Initial State**:
  Endpoints had no throttling or rate limiting, exposing `/api/bookings/lookup` and `/api/bookings/cancel` to automated brute-force attacks and denial-of-service.
- **Remediation**:
  1. Implemented `RateLimitingService`: an in-memory sliding-window rate limiter per client IP address.
  2. Rate limit rules:
     - `POST /api/bookings/lookup`: Maximum 15 requests per 60 seconds per IP.
     - `POST /api/bookings/cancel`: Maximum 10 requests per 60 seconds per IP.
     - Brute-force lockout: 5 consecutive failed lookup attempts trigger an automatic 5-minute cooldown (300 seconds).
  3. Responses return HTTP 429 Too Many Requests with standard `Retry-After` header.

---

### VULN-05: Missing OWASP HTTP Security Headers & Sensitive Cache-Control
- **Severity**: **MEDIUM** (CVSS 6.1)
- **Initial State**:
  Backend responses lacked essential defensive headers, and sensitive booking responses could be cached by intermediary proxies or browsers.
- **Remediation**:
  1. Implemented `SecurityHeadersFilter` (`Ordered.HIGHEST_PRECEDENCE`):
     - `X-Content-Type-Options: nosniff`
     - `X-Frame-Options: DENY`
     - `Referrer-Policy: strict-origin-when-cross-origin`
     - `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; sandbox`
     - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
     - For all `/api/bookings/**` paths: `Cache-Control: no-store, no-cache, must-revalidate, max-age=0` and `Pragma: no-cache`.
  2. Frontend `index.html` configured with meta tags for Content-Security-Policy, X-Content-Type-Options, and Referrer-Policy.

---

### VULN-06: Permissive CORS Configuration
- **Severity**: **MEDIUM** (CVSS 5.3)
- **Initial State**:
  `CorsConfig.java` allowed all request headers (`allowedHeaders("*")`).
- **Remediation**:
  Restricted allowed origins strictly to explicit development and staging origins (`http://localhost:4200`, `http://127.0.0.1:4200`). Restricted allowed headers to `Content-Type`, `Accept`, `Authorization`, `X-Requested-With`, `Origin`. Exposed `Retry-After` header for rate limiting.

---

### VULN-08: Database Least-Privilege Provisioning
- **Severity**: **MEDIUM** (CVSS 6.5)
- **Initial State**:
  Application was configured to connect using the MySQL administrative `root` user with no password.
- **Remediation**:
  1. Created `database/create_app_user.sql` creating dedicated user `'hotel_app_user'@'localhost'`.
  2. Granted strictly required DML privileges (`SELECT, INSERT, UPDATE, DELETE`) on `hotel_booking_db.*`.
  3. Stripped all administrative, DDL (`DROP`, `ALTER`, `CREATE`), and privilege-granting rights.
  4. Updated `application.properties.example` with dedicated user instructions.

---

### VULN-11: Cryptographically Secure Identifier Generation
- **Severity**: **LOW** (CVSS 3.7)
- **Initial State**:
  `BookingService.generateBookingReference()` utilized pseudo-random `UUID.randomUUID()` substrings.
- **Remediation**:
  Replaced with `java.security.SecureRandom` sampling from a 16-character alphanumeric keyspace (`0123456789ABCDEF`), generating high-entropy references (`THB-YYYYMMDD-XXXXXX`) backed by system entropy (`/dev/urandom` or Windows CryptoAPI).

---

## 4. Summary of Files Modified & Created

### Backend Files
- `src/main/java/com/hotelbooking/dto/BookingLookupRequestDto.java` *(New)*
- `src/main/java/com/hotelbooking/dto/BookingLookupResponseDto.java` *(New)*
- `src/main/java/com/hotelbooking/dto/BookingDataDto.java` *(New)*
- `src/main/java/com/hotelbooking/dto/SecureCancelBookingRequestDto.java` *(New)*
- `src/main/java/com/hotelbooking/service/BookingVerificationService.java` *(New)*
- `src/main/java/com/hotelbooking/service/RateLimitingService.java` *(New)*
- `src/main/java/com/hotelbooking/exception/RateLimitExceededException.java` *(New)*
- `src/main/java/com/hotelbooking/config/SecurityHeadersFilter.java` *(New)*
- `src/main/java/com/hotelbooking/config/CorsConfig.java` *(Hardened)*
- `src/main/java/com/hotelbooking/controller/BookingController.java` *(Added POST /lookup, POST /cancel)*
- `src/main/java/com/hotelbooking/service/BookingService.java` *(Added lookupBooking, secureCancelBooking, SecureRandom)*
- `src/main/java/com/hotelbooking/dto/BookingRequestDto.java` *(Hardened @Pattern, @Size, @Positive)*
- `src/main/java/com/hotelbooking/exception/GlobalExceptionHandler.java` *(Added RateLimit handler, masked log inputs)*
- `src/test/java/com/hotelbooking/security/SecurityHardeningTest.java` *(New automated test suite)*
- `src/test/java/com/hotelbooking/service/BookingServiceTest.java` *(Added lookup & cancellation tests)*
- `src/test/java/com/hotelbooking/controller/BookingControllerTest.java` *(Added endpoint tests)*

### Frontend Files
- `src/app/models/booking.model.ts` *(Added BookingData, BookingLookupRequest, BookingLookupResponse, SecureCancelBookingRequest)*
- `src/app/services/booking.service.ts` *(Added lookupBooking, secureCancelBooking)*
- `src/app/pages/my-bookings/my-bookings.component.ts` *(Removed queryParam reading, clean URL, form clearing, secure lookup & cancel)*
- `src/app/pages/booking-confirmation/booking-confirmation.component.ts` *(Clean URL, router state reading, safe fallback)*
- `src/app/pages/booking-form/booking-form.component.ts` *(Router state navigation, form reset)*
- `src/app/app.routes.ts` *(Clean routes for /confirmation and /my-bookings)*
- `src/index.html` *(Added CSP, Referrer-Policy, nosniff meta tags)*
- `src/app/services/booking.service.spec.ts` *(Added lookup and cancel tests)*
- `src/app/pages/my-bookings/my-bookings.component.spec.ts` *(New unit test suite)*

### Database & Documentation Files
- `database/create_app_user.sql` *(New least-privilege script)*
- `SECURITY_AUDIT.md` *(New comprehensive audit document)*
- `README.md` *(Updated with security architecture and configuration)*

---

## 5. Verification & Test Results

### 1. Backend Automated Test Suite (JUnit 5 + Mockito + Spring Boot Test)
Command: `mvn clean test`  
- Total Tests Executed: **34**  
- Failures: **0**  
- Errors: **0**  
- Skipped: **0**  
- Build Status: **SUCCESS**

**Key Test Cases Verified**:
- `SecurityHardeningTest.testVerificationSessionLifecycle`: Session token creation, validation, expiration, and single-use invalidation.
- `SecurityHardeningTest.testRateLimiterEnforcement`: IP sliding window limits and 5-minute lockout on consecutive failures.
- `SecurityHardeningTest.testSecurityHeadersApplied`: Validation of `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Cache-Control: no-store`.
- `SecurityHardeningTest.testXssPayloadRejectedInValidation`: Rejection of `<script>` tags in guest name.
- `BookingControllerTest.testLookupBookingSuccess`: Validation of POST `/api/bookings/lookup`.
- `BookingControllerTest.testLookupBookingInvalidReferenceFormat`: 400 Bad Request on malformed reference.
- `BookingControllerTest.testSecureCancelBookingSuccess`: Authorized cancellation via POST `/api/bookings/cancel`.
- `BookingServiceTest.testLookupBookingSuccess`: Retrieval of safe `BookingData` without database IDs.
- `BookingServiceTest.testLookupBookingMismatchFails`: Rejection with generic error and failure recording.
- `BookingServiceTest.testSecureCancelBookingInvalidTokenFails`: Expired/fake token rejection.

### 2. Frontend Automated Test Suite (Angular 17 + Karma + Jasmine + ChromeHeadless)
Command: `npm test -- --watch=false --browsers=ChromeHeadless`  
- Total Tests Executed: **21**  
- Failures: **0**  
- Skipped: **0**  
- Status: **TOTAL: 21 SUCCESS**

**Key Test Cases Verified**:
- `MyBookingsComponent`: Initializes secure form, rejects invalid reference patterns, calls POST lookup, and resets form fields to prevent screen caching.
- `BookingService`: Validates POST `/api/bookings/lookup` and POST `/api/bookings/cancel`.
- `BookingFormComponent`: Validates guest inputs, minimum lengths, and email formats.

### 3. Live End-to-End Security Verification (PowerShell Integration)
- **Test 1: OWASP Security Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Cache-Control: no-store` confirmed present.
- **Test 2: Reference Entropy**: Regex pattern `^THB-\d{8}-[A-F0-9]{6}$` matched with `SecureRandom`.
- **Test 3: POST Lookup**: Clean retrieval with zero URL query parameters. Internal database ID confirmed stripped.
- **Test 4: Anti-Enumeration (IDOR)**: Attacker email lookup returned safe HTTP 404 (`"Unable to retrieve booking with the provided details."`).
- **Test 5: Reference Format Rejection**: Malformed reference returned HTTP 400.
- **Test 6: Expired Token Rejection**: Fake token cancelled attempt returned HTTP 400.
- **Test 7: Authorized Cancellation**: Valid token cancellation returned HTTP 200 with status `CANCELLED`.
- **Test 8: Single-Use Invalidation**: Re-using the cancelled token immediately returned HTTP 400.
- **Test 9: Rate Limiting**: Sending 5 consecutive invalid lookups triggered HTTP 429 Too Many Requests (`Retry-After: 300`).
- **Test 10: Clean URL**: `http://localhost:4200/my-bookings` loaded cleanly with zero query parameters.

---

## 6. Remaining Risks & Defense-in-Depth Considerations

While all identified application vulnerabilities have been fixed, the following environmental factors must be managed in production:

1. **Transport Layer Security (TLS / HTTPS)**:
   - *Risk*: Without HTTPS, request bodies sent over the wire could be intercepted on untrusted networks (e.g. public Wi-Fi).
   - *Recommendation*: Deploy backend and frontend behind an HTTPS reverse proxy (such as NGINX, Cloudflare, or AWS ALB) with automated TLS certificates (Let's Encrypt), enforcing HTTP Strict Transport Security (`Strict-Transport-Security: max-age=31536000; includeSubDomains`).
2. **Distributed Rate Limiting**:
   - *Risk*: The current rate limiter uses an in-memory sliding window, which protects a single instance. If horizontally scaled behind a load balancer, multiple backend nodes would not share rate limit state.
   - *Recommendation*: When deploying multiple container replicas, migrate `RateLimitingService` to a Redis-backed token bucket or configure rate limiting at the API Gateway / Cloudflare WAF layer.
3. **Automated Bot Protection**:
   - *Risk*: A distributed botnet with thousands of rotating IP addresses could attempt low-and-slow reference brute forcing.
   - *Recommendation*: Consider adding a privacy-preserving CAPTCHA (such as Cloudflare Turnstile or reCAPTCHA v3) on the public lookup form if internet-facing.
4. **Secret Management**:
   - *Risk*: Hardcoded secrets in source code repositories.
   - *Recommendation*: Credentials must always be injected via environment variables (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`) or cloud secret managers (AWS Secrets Manager, HashiCorp Vault), never committed to Git.

---

## 7. Production Deployment Checklist

- [x] Sensitive parameters eliminated from all URLs and browser histories.
- [x] POST `/api/bookings/lookup` and POST `/api/bookings/cancel` implemented.
- [x] Short-lived cryptographic verification session tokens enforced for cancellations.
- [x] Rate limiting active on booking lookup and cancellation.
- [x] OWASP security headers (`nosniff`, `DENY`, `strict-origin`, CSP) active.
- [x] `Cache-Control: no-store` enforced on all booking endpoints.
- [x] Dedicated MySQL user `hotel_app_user` created with least privileges.
- [x] Database credentials externalized via environment variables.
- [x] Angular template sanitization verified (zero `innerHTML` or `bypassSecurityTrustHtml`).
- [x] All 34 backend automated tests passing (0 failures).
- [x] All 21 frontend automated tests passing (0 failures).
