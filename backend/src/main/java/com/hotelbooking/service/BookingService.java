package com.hotelbooking.service;

import com.hotelbooking.dto.BookingRequestDto;
import com.hotelbooking.dto.BookingResponseDto;
import com.hotelbooking.dto.EstimateRequestDto;
import com.hotelbooking.dto.EstimateResponseDto;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final HotelRepository hotelRepository;
    private final RoomTypeRepository roomTypeRepository;

    public BookingService(BookingRepository bookingRepository,
                          HotelRepository hotelRepository,
                          RoomTypeRepository roomTypeRepository) {
        this.bookingRepository = bookingRepository;
        this.hotelRepository = hotelRepository;
        this.roomTypeRepository = roomTypeRepository;
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
     * Uses PESSIMISTIC_WRITE lock on RoomType to prevent simultaneous overbooking
     * when multiple users attempt to reserve the last available room concurrently.
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

        // 4. Generate unique business booking reference
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

    @Transactional(readOnly = true)
    public BookingResponseDto getBookingByReferenceAndEmail(String reference, String email) {
        if (reference == null || reference.trim().isEmpty() || email == null || email.trim().isEmpty()) {
            throw new InvalidBookingReferenceException("Booking reference and guest email are both required.");
        }

        Booking booking = bookingRepository.findByBookingReferenceAndGuestEmailIgnoreCase(
                reference.trim(),
                email.trim().toLowerCase()
        ).orElseThrow(() -> new InvalidBookingReferenceException(
                "No booking found matching reference '" + reference.trim() + "' and email '" + email.trim() + "'."
        ));

        return mapToBookingResponseDto(booking);
    }

    /**
     * Cancels an active CONFIRMED booking.
     * Releases reserved room capacity immediately for other guests.
     * Prevents repeated cancellations.
     */
    @Transactional
    public BookingResponseDto cancelBooking(String reference, String email) {
        if (reference == null || reference.trim().isEmpty() || email == null || email.trim().isEmpty()) {
            throw new InvalidBookingReferenceException("Booking reference and guest email are required for cancellation.");
        }

        Booking booking = bookingRepository.findByBookingReferenceAndGuestEmailIgnoreCase(
                reference.trim(),
                email.trim().toLowerCase()
        ).orElseThrow(() -> new InvalidBookingReferenceException(
                "No active booking found matching reference '" + reference.trim() + "' and email '" + email.trim() + "'."
        ));

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new BookingCancellationException("Booking '" + reference.trim() + "' is already cancelled.");
        }

        booking.setBookingStatus(BookingStatus.CANCELLED);
        Booking updatedBooking = bookingRepository.save(booking);

        return mapToBookingResponseDto(updatedBooking);
    }

    private String generateBookingReference() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        return "THB-" + datePart + "-" + randomPart;
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
