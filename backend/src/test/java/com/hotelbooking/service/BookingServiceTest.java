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
import com.hotelbooking.exception.RoomUnavailableException;
import com.hotelbooking.repository.BookingRepository;
import com.hotelbooking.repository.HotelRepository;
import com.hotelbooking.repository.RoomTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private RoomTypeRepository roomTypeRepository;

    @InjectMocks
    private BookingService bookingService;

    private Hotel sampleHotel;
    private RoomType sampleRoomType;

    @BeforeEach
    void setUp() {
        sampleHotel = new Hotel(1L, "Grand Palace Hotel", "Mumbai", "Luxury Hotel", "https://img.url");
        sampleRoomType = new RoomType(1L, sampleHotel, "Luxury Heritage Suite", BigDecimal.valueOf(5000), 5, "Wi-Fi, Pool");
    }

    @Test
    @DisplayName("Should correctly calculate number of nights and total amount")
    void testCalculateEstimateSuccess() {
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = LocalDate.now().plusDays(8); // 3 nights

        when(hotelRepository.findById(1L)).thenReturn(Optional.of(sampleHotel));
        when(roomTypeRepository.findFirstByHotelId(1L)).thenReturn(Optional.of(sampleRoomType));
        when(bookingRepository.countOverlappingConfirmedBookings(eq(1L), eq(BookingStatus.CONFIRMED), eq(checkIn), eq(checkOut)))
                .thenReturn(2);

        EstimateRequestDto request = new EstimateRequestDto(1L, checkIn, checkOut);
        EstimateResponseDto estimate = bookingService.calculateEstimate(request);

        assertNotNull(estimate);
        assertEquals(3, estimate.getNumberOfNights());
        assertEquals(0, new BigDecimal("15000").compareTo(estimate.getTotalAmount())); // 3 * 5000
        assertEquals(3, estimate.getAvailableRooms()); // 5 total - 2 booked
        assertTrue(estimate.getIsAvailable());
    }

    @Test
    @DisplayName("Should reject check-in date in the past")
    void testCheckInDateInPast() {
        LocalDate pastCheckIn = LocalDate.now().minusDays(1);
        LocalDate checkOut = LocalDate.now().plusDays(2);

        BookingRequestDto request = new BookingRequestDto(1L, 1L, "John Doe", "john@example.com", pastCheckIn, checkOut);

        InvalidBookingDatesException ex = assertThrows(InvalidBookingDatesException.class, () ->
                bookingService.createBooking(request)
        );
        assertTrue(ex.getMessage().contains("past"));
    }

    @Test
    @DisplayName("Should reject check-out date on or before check-in date")
    void testCheckOutBeforeOrSameAsCheckIn() {
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOutSame = LocalDate.now().plusDays(5);
        LocalDate checkOutBefore = LocalDate.now().plusDays(4);

        BookingRequestDto sameDay = new BookingRequestDto(1L, 1L, "John Doe", "john@example.com", checkIn, checkOutSame);
        assertThrows(InvalidBookingDatesException.class, () -> bookingService.createBooking(sameDay));

        BookingRequestDto beforeDay = new BookingRequestDto(1L, 1L, "John Doe", "john@example.com", checkIn, checkOutBefore);
        assertThrows(InvalidBookingDatesException.class, () -> bookingService.createBooking(beforeDay));
    }

    @Test
    @DisplayName("Should confirm booking when rooms are available and enforce backend price calculation")
    void testCreateBookingSuccess() {
        LocalDate checkIn = LocalDate.now().plusDays(2);
        LocalDate checkOut = LocalDate.now().plusDays(4); // 2 nights

        when(roomTypeRepository.findByIdWithLock(1L)).thenReturn(Optional.of(sampleRoomType));
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(sampleHotel));
        when(bookingRepository.countOverlappingConfirmedBookings(eq(1L), eq(BookingStatus.CONFIRMED), eq(checkIn), eq(checkOut)))
                .thenReturn(4); // 4 of 5 booked -> 1 room remaining

        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            b.setId(99L);
            return b;
        });

        BookingRequestDto request = new BookingRequestDto(1L, 1L, "Alice Smith", "alice@example.com", checkIn, checkOut);
        BookingResponseDto response = bookingService.createBooking(request);

        assertNotNull(response);
        assertEquals("Alice Smith", response.getGuestName());
        assertEquals("alice@example.com", response.getGuestEmail());
        assertEquals(2, response.getNumberOfNights());
        assertEquals(0, new BigDecimal("10000").compareTo(response.getTotalAmount())); // 2 * 5000 = 10000
        assertEquals(BookingStatus.CONFIRMED, response.getBookingStatus());
        assertNotNull(response.getBookingReference());
        assertTrue(response.getBookingReference().startsWith("THB-"));

        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    @DisplayName("Should reject booking when no rooms are available")
    void testCreateBookingNoRoomsAvailable() {
        LocalDate checkIn = LocalDate.now().plusDays(2);
        LocalDate checkOut = LocalDate.now().plusDays(4);

        when(roomTypeRepository.findByIdWithLock(1L)).thenReturn(Optional.of(sampleRoomType));
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(sampleHotel));
        when(bookingRepository.countOverlappingConfirmedBookings(eq(1L), eq(BookingStatus.CONFIRMED), eq(checkIn), eq(checkOut)))
                .thenReturn(5); // all 5 rooms booked

        BookingRequestDto request = new BookingRequestDto(1L, 1L, "Bob Jones", "bob@example.com", checkIn, checkOut);

        RoomUnavailableException ex = assertThrows(RoomUnavailableException.class, () ->
                bookingService.createBooking(request)
        );
        assertTrue(ex.getMessage().contains("No rooms available"));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("Should cancel an active confirmed booking and release capacity")
    void testCancelBookingSuccess() {
        String ref = "THB-20261123-ABCD12";
        String email = "guest@example.com";

        Booking booking = new Booking(ref, "Guest", email, sampleHotel, sampleRoomType,
                LocalDate.now().plusDays(2), LocalDate.now().plusDays(4), 2,
                BigDecimal.valueOf(5000), BigDecimal.valueOf(10000), BookingStatus.CONFIRMED);

        when(bookingRepository.findByBookingReferenceAndGuestEmailIgnoreCase(ref, email))
                .thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        BookingResponseDto response = bookingService.cancelBooking(ref, email);

        assertNotNull(response);
        assertEquals(BookingStatus.CANCELLED, response.getBookingStatus());
        assertEquals(BookingStatus.CANCELLED, booking.getBookingStatus());
        verify(bookingRepository, times(1)).save(booking);
    }

    @Test
    @DisplayName("Should reject repeated cancellation of already cancelled booking")
    void testRepeatedCancellationRejected() {
        String ref = "THB-20261123-ABCD12";
        String email = "guest@example.com";

        Booking cancelledBooking = new Booking(ref, "Guest", email, sampleHotel, sampleRoomType,
                LocalDate.now().plusDays(2), LocalDate.now().plusDays(4), 2,
                BigDecimal.valueOf(5000), BigDecimal.valueOf(10000), BookingStatus.CANCELLED);

        when(bookingRepository.findByBookingReferenceAndGuestEmailIgnoreCase(ref, email))
                .thenReturn(Optional.of(cancelledBooking));

        BookingCancellationException ex = assertThrows(BookingCancellationException.class, () ->
                bookingService.cancelBooking(ref, email)
        );
        assertTrue(ex.getMessage().contains("already cancelled"));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("Should reject retrieve booking when reference or email do not match")
    void testRetrieveBookingInvalidCredentials() {
        String ref = "THB-INVALID";
        String email = "wrong@example.com";

        when(bookingRepository.findByBookingReferenceAndGuestEmailIgnoreCase(ref, email))
                .thenReturn(Optional.empty());

        assertThrows(InvalidBookingReferenceException.class, () ->
                bookingService.getBookingByReferenceAndEmail(ref, email)
        );
    }
}
