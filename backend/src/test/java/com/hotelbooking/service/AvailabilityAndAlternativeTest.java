package com.hotelbooking.service;

import com.hotelbooking.dto.AlternativeHotelDto;
import com.hotelbooking.dto.AvailabilityResponseDto;
import com.hotelbooking.entity.BookingStatus;
import com.hotelbooking.entity.Hotel;
import com.hotelbooking.entity.RoomType;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AvailabilityAndAlternativeTest {

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private RoomTypeRepository roomTypeRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private HotelService hotelService;

    private Hotel hotel1;
    private Hotel hotel2;
    private RoomType roomType1;
    private RoomType roomType2;

    @BeforeEach
    void setUp() {
        hotel1 = new Hotel(1L, "Grand Palace Hotel", "Mumbai", "Palace", "https://img1.url");
        hotel2 = new Hotel(2L, "Marine Bay Luxury Suites", "Mumbai", "Boutique", "https://img2.url");

        roomType1 = new RoomType(1L, hotel1, "Luxury Suite", BigDecimal.valueOf(5000), 5, "WiFi, Pool");
        roomType2 = new RoomType(2L, hotel2, "Ocean View", BigDecimal.valueOf(4500), 6, "WiFi, Sea View");
    }

    @Test
    @DisplayName("Should verify room availability logic and calculation")
    void testCheckAvailability() {
        LocalDate checkIn = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(15);

        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel1));
        when(roomTypeRepository.findFirstByHotelId(1L)).thenReturn(Optional.of(roomType1));
        when(bookingRepository.countOverlappingConfirmedBookings(eq(1L), eq(BookingStatus.CONFIRMED), eq(checkIn), eq(checkOut)))
                .thenReturn(2);

        AvailabilityResponseDto response = hotelService.checkAvailability(1L, checkIn, checkOut);

        assertNotNull(response);
        assertEquals(5, response.getTotalRooms());
        assertEquals(2, response.getBookedRooms());
        assertEquals(3, response.getAvailableRooms());
        assertTrue(response.getIsAvailable());
        assertEquals(5, response.getNumberOfNights());
        assertEquals(0, new BigDecimal("25000").compareTo(response.getTotalAmount()));
    }

    @Test
    @DisplayName("Surprise Feature: Should recommend alternative hotels in the same location when selected hotel is full")
    void testAlternativeHotelsRecommendation() {
        LocalDate checkIn = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(13);

        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel1));
        when(hotelRepository.findAlternativesByLocation("Mumbai", 1L)).thenReturn(List.of(hotel2));
        when(roomTypeRepository.findFirstByHotelId(2L)).thenReturn(Optional.of(roomType2));
        // Hotel 2 has 2 bookings out of 6 rooms -> 4 available
        when(bookingRepository.countOverlappingConfirmedBookings(eq(2L), eq(BookingStatus.CONFIRMED), eq(checkIn), eq(checkOut)))
                .thenReturn(2);

        List<AlternativeHotelDto> alternatives = hotelService.getAlternativeHotels(1L, checkIn, checkOut);

        assertNotNull(alternatives);
        assertEquals(1, alternatives.size());
        AlternativeHotelDto alt = alternatives.get(0);
        assertEquals(2L, alt.getHotelId());
        assertEquals("Marine Bay Luxury Suites", alt.getHotelName());
        assertEquals("Mumbai", alt.getLocation());
        assertEquals(4, alt.getAvailableRooms());
    }

    @Test
    @DisplayName("Surprise Feature: Should return empty list if all alternatives in same location are also fully booked")
    void testNoAlternativesAvailableWhenAllBooked() {
        LocalDate checkIn = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(13);

        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel1));
        when(hotelRepository.findAlternativesByLocation("Mumbai", 1L)).thenReturn(List.of(hotel2));
        when(roomTypeRepository.findFirstByHotelId(2L)).thenReturn(Optional.of(roomType2));
        // Hotel 2 is completely booked (6 out of 6)
        when(bookingRepository.countOverlappingConfirmedBookings(eq(2L), eq(BookingStatus.CONFIRMED), eq(checkIn), eq(checkOut)))
                .thenReturn(6);

        List<AlternativeHotelDto> alternatives = hotelService.getAlternativeHotels(1L, checkIn, checkOut);

        assertNotNull(alternatives);
        assertTrue(alternatives.isEmpty(), "Should return empty list when all alternatives are fully booked");
    }
}
