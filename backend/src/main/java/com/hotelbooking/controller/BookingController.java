package com.hotelbooking.controller;

import com.hotelbooking.dto.BookingRequestDto;
import com.hotelbooking.dto.BookingResponseDto;
import com.hotelbooking.dto.CancelBookingRequestDto;
import com.hotelbooking.dto.EstimateRequestDto;
import com.hotelbooking.dto.EstimateResponseDto;
import com.hotelbooking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /**
     * Create a new confirmed booking.
     * POST /api/bookings
     */
    @PostMapping
    public ResponseEntity<BookingResponseDto> createBooking(@Valid @RequestBody BookingRequestDto request) {
        BookingResponseDto response = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Retrieve booking by reference and guest email.
     * GET /api/bookings/{reference}?email=guest@example.com
     */
    @GetMapping("/{reference}")
    public ResponseEntity<BookingResponseDto> getBooking(
            @PathVariable("reference") String reference,
            @RequestParam("email") String email) {
        BookingResponseDto response = bookingService.getBookingByReferenceAndEmail(reference, email);
        return ResponseEntity.ok(response);
    }

    /**
     * Cancel an active booking after verifying guest email.
     * PUT /api/bookings/{reference}/cancel
     * Accepts email from request body or query param.
     */
    @PutMapping("/{reference}/cancel")
    public ResponseEntity<BookingResponseDto> cancelBooking(
            @PathVariable("reference") String reference,
            @RequestBody(required = false) CancelBookingRequestDto body,
            @RequestParam(name = "email", required = false) String emailParam) {

        String effectiveEmail = (body != null && body.getEmail() != null && !body.getEmail().trim().isEmpty())
                ? body.getEmail()
                : emailParam;

        BookingResponseDto response = bookingService.cancelBooking(reference, effectiveEmail);
        return ResponseEntity.ok(response);
    }

    /**
     * Calculate estimated booking amount for selected hotel and dates.
     * POST /api/bookings/estimate
     */
    @PostMapping("/estimate")
    public ResponseEntity<EstimateResponseDto> calculateEstimate(@Valid @RequestBody EstimateRequestDto request) {
        EstimateResponseDto response = bookingService.calculateEstimate(request);
        return ResponseEntity.ok(response);
    }
}
