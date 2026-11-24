package com.hotelbooking.service;

import com.hotelbooking.dto.BookingDataDto;
import com.hotelbooking.dto.BookingLookupRequestDto;
import com.hotelbooking.dto.BookingLookupResponseDto;
import com.hotelbooking.dto.BookingRequestDto;
import com.hotelbooking.dto.BookingResponseDto;
import com.hotelbooking.dto.EstimateRequestDto;
import com.hotelbooking.dto.EstimateResponseDto;
import com.hotelbooking.dto.SecureCancelBookingRequestDto;
import com.hotelbooking.entity.Booking;
import com.hotelbooking.entity.BookingStatus;
import com.hotelbooking.entity.Hotel;
import com.hotelbooking.entity.RoomType;
import com.hotelbooking.exception.BookingCancellationException;
import com.hotelbooking.exception.InvalidBookingDatesException;
import com.hotelbooking.exception.InvalidBookingReferenceException;
import com.hotelbooking.exception.ResourceNotFoundException;
import com.hotelbooking.exception.RoomUnavailableException;
import com.hotelbooking.repository.BookingRepository;
import com.hotelbooking.repository.HotelRepository;
import com.hotelbooking.repository.RoomTypeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String ALPHANUMERIC = "0123456789ABCDEF";

    private final BookingRepository bookingRepository;
    private final HotelRepository hotelRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final BookingVerificationService verificationService;
    private final RateLimitingService rateLimitingService;

    public BookingService(BookingRepository bookingRepository,
                          HotelRepository hotelRepository,
                          RoomTypeRepository roomTypeRepository,
                          BookingVerificationService verificationService,
                          RateLimitingService rateLimitingService) {
        this.bookingRepository = bookingRepository;
        this.hotelRepository = hotelRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.verificationService = verificationService;
        this.rateLimitingService = rateLimitingService;
    }

    public void validateDates(LocalDate checkIn, LocalDate checkOut) {
        if (checkIn == null || checkOut == null) {
            throw new InvalidBookingDatesException("Check-in and check-out dates are required");
        }
        if (checkIn.isBefore(LocalDate.now())) {
            throw new InvalidBookingDatesException("Check-in date cannot be in the past");
        }
        if (!checkOut.isAfter(checkIn)) {
            throw new InvalidBookingDatesException("Check-out date must be after check-in date");
        }
    }

    @Transactional(readOnly = true)
    public EstimateResponseDto calculateEstimate(EstimateRequestDto request) {
        validateDates(request.getCheckInDate(), request.getCheckOutDate());

        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + request.getHotelId()));

        RoomType roomType = roomTypeRepository.findFirstByHotelId(hotel.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No room type configured for hotel: " + hotel.getName()));

        int nights = (int) ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal totalAmount = roomType.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        int booked = bookingRepository.countOverlappingConfirmedBookings(
                roomType.getId(),
                BookingStatus.CONFIRMED,
                request.getCheckInDate(),
                request.getCheckOutDate()
        );

        int availableRooms = Math.max(0, roomType.getTotalRooms() - booked);

        EstimateResponseDto response = new EstimateResponseDto();
        response.setHotelId(hotel.getId());
        response.setHotelName(hotel.getName());
        response.setRoomTypeId(roomType.getId());
        response.setRoomName(roomType.getRoomName());
        response.setCheckInDate(request.getCheckInDate());
        response.setCheckOutDate(request.getCheckOutDate());
        response.setNumberOfNights(nights);
        response.setPricePerNight(roomType.getPricePerNight());
        response.setTotalAmount(totalAmount);
        response.setAvailableRooms(availableRooms);
        response.setIsAvailable(availableRooms > 0);

        return response;
    }

    /**
     * Creates a new booking within a single atomic database transaction.
     * Uses PESSIMISTIC_WRITE lock on RoomType to prevent simultaneous overbooking.
     */
    @Transactional
    public BookingResponseDto createBooking(BookingRequestDto request) {
        validateDates(request.getCheckInDate(), request.getCheckOutDate());

        // 1. Acquire pessimistic write lock on the room type record
        RoomType roomType = roomTypeRepository.findByIdWithLock(request.getRoomTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Room category not found with id: " + request.getRoomTypeId()));

        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + request.getHotelId()));

        if (!roomType.getHotel().getId().equals(hotel.getId())) {
            throw new IllegalArgumentException("Selected room category does not belong to hotel: " + hotel.getName());
        }

        // 2. Count current confirmed overlapping bookings within the locked transaction
        int bookedRooms = bookingRepository.countOverlappingConfirmedBookings(
                roomType.getId(),
                BookingStatus.CONFIRMED,
                request.getCheckInDate(),
                request.getCheckOutDate()
        );

        int availableRooms = roomType.getTotalRooms() - bookedRooms;
        if (availableRooms <= 0) {
            throw new RoomUnavailableException("No rooms available for " + hotel.getName() +
                    " (" + roomType.getRoomName() + ") between " +
                    request.getCheckInDate() + " and " + request.getCheckOutDate());
        }

        // 3. Compute nights and final total amount strictly on backend using BigDecimal
        int nights = (int) ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal totalAmount = roomType.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        // 4. Generate cryptographically secure unique business booking reference
        String uniqueRef = generateBookingReference();

        // 5. Create and persist booking record
        Booking booking = new Booking(
                uniqueRef,
                request.getGuestName().trim(),
                request.getGuestEmail().trim().toLowerCase(),
                hotel,
                roomType,
                request.getCheckInDate(),
                request.getCheckOutDate(),
                nights,
                roomType.getPricePerNight(),
                totalAmount,
                BookingStatus.CONFIRMED
        );

        Booking savedBooking = bookingRepository.save(booking);
        return mapToBookingResponseDto(savedBooking);
    }

    /**
     * Secure booking lookup via POST /api/bookings/lookup.
     * Validates both booking reference and guest email.
     * Returns a generic safe error on mismatch to prevent user enumeration.
     * Issues a short-lived cryptographic verification token for subsequent sensitive operations.
     */
    @Transactional(readOnly = true)
    public BookingLookupResponseDto lookupBooking(BookingLookupRequestDto request, String clientIp) {
        // Enforce rate limiting per client IP (15 requests / 60 seconds)
        rateLimitingService.checkRateLimit(clientIp, "booking-lookup", 15, 60);

        String ref = request.getBookingReference().trim();
        String email = request.getEmail().trim().toLowerCase();

        Booking booking = bookingRepository.findByBookingReferenceAndGuestEmailIgnoreCase(ref, email)
                .orElse(null);

        if (booking == null) {
            // Track failure for brute-force lockout (5 consecutive failures = 5 minute cooldown)
            rateLimitingService.recordFailure(clientIp, "booking-lookup", 5, 300);
            throw new InvalidBookingReferenceException("Unable to retrieve booking with the provided details.");
        }

        // Record successful attempt to reset consecutive failure counters
        rateLimitingService.recordSuccess(clientIp, "booking-lookup");

        // Issue server-side short-lived verification session
        String verificationToken = verificationService.createSession(booking.getBookingReference(), booking.getGuestEmail());

        BookingDataDto data = mapToBookingDataDto(booking);
        return new BookingLookupResponseDto("Booking details retrieved successfully", data, verificationToken);
    }

    /**
     * Secure cancellation via POST /api/bookings/cancel.
     * Requires booking reference, matching guest email, and a valid short-lived verification token.
     */
    @Transactional
    public BookingDataDto secureCancelBooking(SecureCancelBookingRequestDto request, String clientIp) {
        // Enforce rate limiting per client IP (10 requests / 60 seconds)
        rateLimitingService.checkRateLimit(clientIp, "booking-cancel", 10, 60);

        String ref = request.getBookingReference().trim();
        String email = request.getEmail().trim().toLowerCase();
        String token = request.getVerificationToken();

        // 1. Verify session ownership and validity
        boolean isSessionValid = verificationService.validateSession(token, ref, email);
        if (!isSessionValid) {
            rateLimitingService.recordFailure(clientIp, "booking-cancel", 5, 300);
            throw new BookingCancellationException("Verification session has expired or is invalid. Please retrieve your booking again.");
        }

        // 2. Retrieve booking from repository
        Booking booking = bookingRepository.findByBookingReferenceAndGuestEmailIgnoreCase(ref, email)
                .orElseThrow(() -> new InvalidBookingReferenceException("Unable to process cancellation with the provided details."));

        // 3. Reject double cancellation
        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new BookingCancellationException("Booking is already cancelled.");
        }

        // 4. Update status and save (releases inventory in overlap availability check)
        booking.setBookingStatus(BookingStatus.CANCELLED);
        Booking updatedBooking = bookingRepository.save(booking);

        // 5. Invalidate single-use verification session
        verificationService.invalidateSession(token);
        rateLimitingService.recordSuccess(clientIp, "booking-cancel");

        return mapToBookingDataDto(updatedBooking);
    }

    /**
     * Legacy retrieve method preserved for internal/test compatibility.
     * Uses generic error message on mismatch to prevent information leakage.
     */
    @Transactional(readOnly = true)
    public BookingResponseDto getBookingByReferenceAndEmail(String reference, String email) {
        if (reference == null || reference.trim().isEmpty() || email == null || email.trim().isEmpty()) {
            throw new InvalidBookingReferenceException("Unable to retrieve booking with the provided details.");
        }

        Booking booking = bookingRepository.findByBookingReferenceAndGuestEmailIgnoreCase(
                reference.trim(),
                email.trim().toLowerCase()
        ).orElseThrow(() -> new InvalidBookingReferenceException("Unable to retrieve booking with the provided details."));

        return mapToBookingResponseDto(booking);
    }

    /**
     * Legacy cancellation method preserved for backward compatibility.
     */
    @Transactional
    public BookingResponseDto cancelBooking(String reference, String email) {
        if (reference == null || reference.trim().isEmpty() || email == null || email.trim().isEmpty()) {
            throw new InvalidBookingReferenceException("Unable to retrieve booking with the provided details.");
        }

        Booking booking = bookingRepository.findByBookingReferenceAndGuestEmailIgnoreCase(
                reference.trim(),
                email.trim().toLowerCase()
        ).orElseThrow(() -> new InvalidBookingReferenceException("Unable to retrieve booking with the provided details."));

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new BookingCancellationException("Booking is already cancelled.");
        }

        booking.setBookingStatus(BookingStatus.CANCELLED);
        Booking updatedBooking = bookingRepository.save(booking);

        return mapToBookingResponseDto(updatedBooking);
    }

    /**
     * Cryptographically secure booking reference generator.
     * Format: THB-YYYYMMDD-XXXXXX using SecureRandom alphanumeric entropy.
     */
    private String generateBookingReference() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            sb.append(ALPHANUMERIC.charAt(SECURE_RANDOM.nextInt(ALPHANUMERIC.length())));
        }
        return "THB-" + datePart + "-" + sb.toString();
    }

    private BookingDataDto mapToBookingDataDto(Booking booking) {
        BookingDataDto dto = new BookingDataDto();
        dto.setBookingReference(booking.getBookingReference());
        dto.setGuestName(booking.getGuestName());
        dto.setGuestEmail(booking.getGuestEmail());
        dto.setHotelName(booking.getHotel().getName());
        dto.setHotelLocation(booking.getHotel().getLocation());
        dto.setRoomName(booking.getRoomType().getRoomName());
        dto.setCheckInDate(booking.getCheckInDate());
        dto.setCheckOutDate(booking.getCheckOutDate());
        dto.setNumberOfNights(booking.getNumberOfNights());
        dto.setPricePerNight(booking.getPricePerNight());
        dto.setTotalAmount(booking.getTotalAmount());
        dto.setBookingStatus(booking.getBookingStatus());
        dto.setCreatedAt(booking.getCreatedAt());
        return dto;
    }

    private BookingResponseDto mapToBookingResponseDto(Booking booking) {
        BookingResponseDto dto = new BookingResponseDto();
        dto.setId(booking.getId());
        dto.setBookingReference(booking.getBookingReference());
        dto.setGuestName(booking.getGuestName());
        dto.setGuestEmail(booking.getGuestEmail());
        dto.setHotelId(booking.getHotel().getId());
        dto.setHotelName(booking.getHotel().getName());
        dto.setHotelLocation(booking.getHotel().getLocation());
        dto.setRoomTypeId(booking.getRoomType().getId());
        dto.setRoomName(booking.getRoomType().getRoomName());
        dto.setCheckInDate(booking.getCheckInDate());
        dto.setCheckOutDate(booking.getCheckOutDate());
        dto.setNumberOfNights(booking.getNumberOfNights());
        dto.setPricePerNight(booking.getPricePerNight());
        dto.setTotalAmount(booking.getTotalAmount());
        dto.setBookingStatus(booking.getBookingStatus());
        dto.setCreatedAt(booking.getCreatedAt());
        return dto;
    }
}
