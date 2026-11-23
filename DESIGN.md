# System Design Document: Hotel Booking Portal

This document outlines the architectural decisions, database schemas, API designs, business algorithms, and concurrency mechanisms underpinning the **Hotel Booking Portal**. It has been structured specifically to serve as a comprehensive interview reference.

---

## 1. System Architecture

The application adopts a **Modern Decoupled Tiered Architecture** separating the presentation client from the backend business logic and database persistence:

```
┌────────────────────────────────────────────────────────┐
│                   Angular 17 Client                    │
│  (TypeScript, Reactive Forms, Router, Standalone UI)   │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON REST APIs (CORS Enabled)
                            ▼
┌────────────────────────────────────────────────────────┐
│               Spring Boot 3 REST Service               │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Controllers (Request Mapping, Input Validation)  │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ Services (Pricing Logic, Date Validation, Lock)  │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ Repositories (Spring Data JPA, Hibernate ORM)    │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────────┬────────────────────────────┘
                            │ JDBC Connection Pool (HikariCP)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   MySQL 8.0 Database                   │
│   (hotel_booking_db: hotels, room_types, bookings)     │
└────────────────────────────────────────────────────────┘
```

### Layer Responsibilities
1. **Frontend Presentation (Angular 17)**:
   - Standalone reactive components with Angular Router navigation.
   - Client-side validation using Angular Reactive Forms (`FormBuilder`, `Validators`).
   - Communication via Angular `HttpClient` consuming REST endpoints.
   - Visual states: Loading spinners, error alerts, empty states, and responsive CSS.
2. **REST Controller Layer (`com.hotelbooking.controller`)**:
   - Accepts incoming HTTP GET, POST, PUT requests and maps JSON payloads to strongly typed DTOs.
   - Enforces bean validation via `@Valid` annotations (`@NotBlank`, `@NotNull`, `@Email`).
   - Converts service outputs into appropriate HTTP responses with standard status codes (`200 OK`, `201 CREATED`, `400 BAD REQUEST`, `404 NOT FOUND`, `409 CONFLICT`).
3. **Business Service Layer (`com.hotelbooking.service`)**:
   - Implements date validation (rejects past check-ins, enforces checkout > checkin).
   - Computes stay duration (`ChronoUnit.DAYS`) and total cost (`BigDecimal` multiplication).
   - Manages room availability calculations across overlapping date ranges.
   - Coordinates pessimistic transaction locks to prevent concurrent race conditions.
4. **Data Persistence Layer (`com.hotelbooking.repository`)**:
   - Spring Data JPA repositories abstracting MySQL queries.
   - Custom JPQL queries for date interval overlap checks and alternative hotel searches.
5. **Relational Database (`MySQL 8.0`)**:
   - Enforces relational referential integrity via foreign keys, primary keys, and index constraints.

---

## 2. Database Design & Relationships

The database `hotel_booking_db` is designed in 3rd Normal Form (3NF) to guarantee data normalization, eliminate anomalies, and maintain audit trails.

### Entity-Relationship Diagram

```
┌─────────────────────────┐
│         hotels          │
├─────────────────────────┤
│ PK  id (BIGINT)         │◄──────────┐
│     name (VARCHAR)      │           │
│     location (VARCHAR)  │           │ 1:N
│     description (TEXT)  │           │
│     image_url (VARCHAR) │           │
│     created_at (TS)     │           │
└────────────┬────────────┘           │
             │ 1:N                    │
             ▼                        │
┌─────────────────────────┐           │
│       room_types        │           │
├─────────────────────────┤           │
│ PK  id (BIGINT)         │           │
│ FK  hotel_id (BIGINT)   │           │
│     room_name (VARCHAR) │           │
│     price_per_night (DEC│           │
│     total_rooms (INT)   │           │
│     amenities (VARCHAR) │           │
└────────────┬────────────┘           │
             │ 1:N                    │
             ▼                        │
┌─────────────────────────────────────┴───┐
│                bookings                 │
├─────────────────────────────────────────┤
│ PK  id (BIGINT)                         │
│ UQ  booking_reference (VARCHAR)         │
│     guest_name (VARCHAR)                │
│     guest_email (VARCHAR)               │
│ FK  hotel_id (BIGINT)                   │
│ FK  room_type_id (BIGINT)               │
│     check_in_date (DATE)                │
│     check_out_date (DATE)               │
│     number_of_nights (INT)              │
│     price_per_night (DECIMAL 10,2)      │
│     total_amount (DECIMAL 10,2)         │
│     booking_status (VARCHAR: CONF/CANC) │
│     created_at (TIMESTAMP)              │
└─────────────────────────────────────────┘
```

### Table Definitions & Key Decisions
1. **`hotels`**: Stores primary property information.
   - Indexed on `location` for fast city-based searches (`Mumbai`, `Goa`, `Pune`).
2. **`room_types`**: Stores room categories, capacities, and base rates.
   - `total_rooms`: Defines the hard physical inventory ceiling for the room category.
   - `price_per_night`: Stored as `DECIMAL(10,2)` to prevent floating-point rounding errors.
3. **`bookings`**: Stores reservations.
   - `booking_reference`: Unique business key (e.g. `THB-20261123-50A1E3`) indexed with a `UNIQUE` constraint.
   - `price_per_night` and `total_amount`: **Historical Price Immutability Pattern** — snapshots the exact monetary rate agreed upon at the time of booking. If the hotel adjusts rates later, past booking records remain financially accurate.
   - Composite index `(check_in_date, check_out_date)` and index on `booking_status` accelerate overlap evaluation during availability queries.

---

## 3. REST API Design

All endpoints follow RESTful naming conventions and utilize standard HTTP methods and status codes.

| Endpoint | Method | Description | Success Status | Error Statuses |
|---|---|---|---|---|
| `/api/hotels` | `GET` | Retrieve all hotels with room categories | `200 OK` | `500` |
| `/api/hotels/{id}` | `GET` | Retrieve single hotel by ID | `200 OK` | `404 NOT FOUND` |
| `/api/hotels/search?location={city}` | `GET` | Search hotels by location | `200 OK` | `500` |
| `/api/hotels/{id}/availability?checkIn={d}&checkOut={d}` | `GET` | Check room availability & get stay cost | `200 OK` | `400 BAD REQUEST`, `404` |
| `/api/hotels/{id}/alternatives?checkIn={d}&checkOut={d}` | `GET` | Smart recommendations in same location | `200 OK` | `400 BAD REQUEST`, `404` |
| `/api/bookings` | `POST` | Create a verified booking | `201 CREATED` | `400`, `404`, `409 CONFLICT` |
| `/api/bookings/{reference}?email={email}` | `GET` | Retrieve booking details | `200 OK` | `404 NOT FOUND` |
| `/api/bookings/{reference}/cancel` | `PUT` | Cancel booking & release room capacity | `200 OK` | `400`, `404 NOT FOUND` |
| `/api/bookings/estimate` | `POST` | Calculate estimated booking amount | `200 OK` | `400 BAD REQUEST`, `404` |

### Consistent Error Response Contract
No raw SQL or Java stack traces are ever exposed to the client. The `@RestControllerAdvice` (`GlobalExceptionHandler`) intercepts all checked and unchecked exceptions and formats them as:

```json
{
  "timestamp": "2026-11-23T23:44:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Check-out date must be after check-in date"
}
```

---

## 4. Core Booking Business Logic

### A. Date Validation
1. Check-in and check-out dates are represented as Java `java.time.LocalDate`.
2. Check-in date cannot be prior to today:
   $$\text{checkIn} \ge \text{LocalDate.now()}$$
3. Check-out date must be strictly after check-in date:
   $$\text{checkOut} > \text{checkIn}$$
4. Same-day bookings or negative durations are rejected immediately with HTTP 400.

### B. Stay Duration & Pricing Calculation
- **Stay Duration**:
  $$\text{numberOfNights} = \text{ChronoUnit.DAYS.between}(\text{checkIn}, \text{checkOut})$$
- **Total Amount**:
  $$\text{totalAmount} = \text{pricePerNight} \times \text{numberOfNights}$$
- Calculated strictly in `BookingService` using `java.math.BigDecimal` with scaling to ensure monetary accuracy. Any price values submitted by the frontend are discarded.

### C. Room Availability & Overlap Formula
A room category has a physical ceiling of $C = \text{total\_rooms}$.
Two date intervals $[S_1, E_1)$ and $[S_2, E_2)$ overlap if and only if:
$$S_1 < E_2 \quad \text{AND} \quad E_1 > S_2$$

#### Boundary Condition Analysis:
- Booking 1: Check-in Dec 10, Check-out Dec 15 ($[10, 15)$)
- Booking 2: Check-in Dec 15, Check-out Dec 18 ($[15, 18)$)
- Evaluated: $S_1 < E_2 \implies 10 < 18$ (True), BUT $E_1 > S_2 \implies 15 > 15$ (**False**).
- Result: **No Overlap!** Booking 2 can safely occupy the room released on Dec 15.

#### Capacity Rule:
$$\text{bookedRooms} = \text{COUNT}(\text{confirmed bookings overlapping requested dates})$$
$$\text{availableRooms} = \max(0, \text{totalRooms} - \text{bookedRooms})$$
$$\text{isAvailable} = \text{availableRooms} > 0$$

### D. Cancellation & Capacity Release Logic
1. Matches both `bookingReference` and `guestEmail` (case-insensitive).
2. Verifies current status is `CONFIRMED`. If already `CANCELLED`, throws `BookingCancellationException` (prevents double cancellation).
3. Updates status to `CANCELLED`.
4. Because the availability query filters strictly on `bookingStatus = 'CONFIRMED'`, cancelling immediately restores inventory capacity.

---

## 5. Simultaneous Booking Protection (Concurrency Control)

### The Race Condition Problem
Consider Hotel X with 1 room available.
Two users, User A and User B, attempt to book the room for the same weekend simultaneously:
1. Thread A checks availability: finds 1 room available.
2. Thread B checks availability before Thread A commits: also finds 1 room available.
3. Thread A inserts a confirmed booking.
4. Thread B inserts a confirmed booking.
5. **Result: 2 rooms booked for a 1-room hotel (Overbooking failure).**

### Solution: Database Pessimistic Locking
We solve this at the database engine level using Spring's `@Transactional` alongside JPA's `PESSIMISTIC_WRITE`:

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT r FROM RoomType r WHERE r.id = :id")
Optional<RoomType> findByIdWithLock(@Param("id") Long id);
```

#### Step-by-Step Execution Flow:
1. When User A begins `createBooking()`, Spring opens a transaction and issues:
   ```sql
   SELECT * FROM room_types WHERE id = ? FOR UPDATE;
   ```
2. MySQL acquires an exclusive row-level write lock on the `room_types` row.
3. When User B's thread executes `createBooking()`, it attempts to acquire the lock on the same row. MySQL suspends Thread B until Thread A's transaction finishes.
4. Thread A executes the availability count query, confirms 1 room is available, writes the booking record, and commits.
5. Thread A's transaction commits, releasing the lock.
6. Thread B immediately acquires the lock and now executes the availability count query.
7. Thread B sees that 1 room is now booked (0 rooms available).
8. Thread B throws `RoomUnavailableException` (HTTP 409 Conflict).
9. **Zero overbooking occurs.**

This behavior is tested and verified in `BookingConcurrencyAndIntegrationTest.java` using concurrent threads and `CountDownLatch`.

---

## 6. Surprise Feature: Smart Alternative Hotel Recommendations

### Problem Solved
In standard booking systems, when a user selects dates for a hotel and encounters "Sold Out / No Rooms Available", the user faces an abrupt dead end and must restart their search from scratch.

### Implementation Details
When `HotelService.checkAvailability()` reports 0 available rooms:
1. **Location Match**: Queries `hotelRepository.findAlternativesByLocation(originalHotel.getLocation(), originalHotel.getId())` to find other properties in the exact same city.
2. **Date Recheck**: For each alternative property, reuses the core interval overlap query `countOverlappingConfirmedBookings()` for the user's exact check-in and check-out dates.
3. **Availability Filter**: Filters candidate hotels to only include those where:
   $$\text{availableRooms} = \text{totalRooms} - \text{bookedRooms} > 0$$
4. **DTO Projection**: Formats candidate properties into `AlternativeHotelDto` displaying photo, amenities, price per night, and available room counts.
5. **Frontend Flow**: On the Hotel Details page, when availability is 0, an attractive amber notification displays the alternative recommendations with a single-click **"View & Book Alternative"** button that navigates directly to the alternative hotel with the same dates pre-filled.

---

## 7. Design Decisions & Trade-Offs

| Decision | Alternative Considered | Why We Chose This Approach |
|---|---|---|
| **Pessimistic Locking (`PESSIMISTIC_WRITE`)** | Optimistic Locking (`@Version`) | For high-contention booking of the last remaining room, optimistic locking causes optimistic lock exceptions that require complex retry logic. Pessimistic row locking serializes execution at the DB level, guaranteeing strict correctness. |
| **Interval-Based Overlap Query** | Day-by-day availability calendar table | Storing each individual calendar day per room requires massive batch inserts and maintenance jobs. Mathematical interval overlap ($S_1 < E_2 \land E_1 > S_2$) calculates availability dynamically in $O(1)$ database index scans. |
| **Backend-Enforced Calculation** | Frontend-submitted totals | Never trust client input for financial transactions. Backend fetches live database price and calculates total using `BigDecimal`. |
| **Standalone Components in Angular 17** | NgModules (`app.module.ts`) | Angular modern best practices favor standalone components for faster lazy-loading, tree-shaking, and clean dependency management. |

---

## 8. Limitations and Future Improvements

1. **Current Limitations**:
   - Single room category per hotel (sufficient for assignment requirements).
   - In-memory database lock relies on a single relational database instance.
2. **Future Production Enhancements**:
   - **Distributed Locking**: For distributed microservices, integrate Redis Redlock for cross-instance availability locking.
   - **Payment Gateway Integration**: Webhook-based asynchronous payment capture (Stripe / Razorpay) with temporary 15-minute booking holds.
   - **User Authentication**: Spring Security + JWT for guest profile history and loyalty points.
   - **Dynamic Pricing Engine**: Weekend and seasonal surge pricing algorithms.
