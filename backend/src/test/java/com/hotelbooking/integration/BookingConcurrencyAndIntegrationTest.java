package com.hotelbooking.integration;

import com.hotelbooking.dto.BookingRequestDto;
import com.hotelbooking.dto.BookingResponseDto;
import com.hotelbooking.entity.BookingStatus;
import com.hotelbooking.entity.Hotel;
import com.hotelbooking.entity.RoomType;
import com.hotelbooking.exception.RoomUnavailableException;
import com.hotelbooking.repository.BookingRepository;
import com.hotelbooking.repository.HotelRepository;
import com.hotelbooking.repository.RoomTypeRepository;
import com.hotelbooking.service.BookingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class BookingConcurrencyAndIntegrationTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @Autowired
    private BookingRepository bookingRepository;

    private Hotel testHotel;
    private RoomType testRoomType;

    @BeforeEach
    void setUp() {
        bookingRepository.deleteAll();
        roomTypeRepository.deleteAll();
        hotelRepository.deleteAll();

        testHotel = new Hotel(null, "Integration Test Hotel", "Goa", "A test resort", "https://img.url");
        testHotel = hotelRepository.save(testHotel);

        // Room with capacity of exactly 2 rooms
        testRoomType = new RoomType(null, testHotel, "Standard Room", BigDecimal.valueOf(3000), 2, "WiFi, AC");
        testRoomType = roomTypeRepository.save(testRoomType);
    }

    @Test
    @DisplayName("Integration: Consecutive non-overlapping stays must not block room capacity")
    void testNonOverlappingConsecutiveStays() {
        LocalDate stay1CheckIn = LocalDate.now().plusDays(10);
        LocalDate stay1CheckOut = LocalDate.now().plusDays(15);

        // Stay 2 starts on the exact day Stay 1 checks out (Dec 15)
        LocalDate stay2CheckIn = LocalDate.now().plusDays(15);
        LocalDate stay2CheckOut = LocalDate.now().plusDays(20);

        // Book 2 rooms for Stay 1 (fills capacity 2/2)
        bookingService.createBooking(new BookingRequestDto(
                testHotel.getId(), testRoomType.getId(), "Guest 1", "g1@test.com", stay1CheckIn, stay1CheckOut));
        bookingService.createBooking(new BookingRequestDto(
                testHotel.getId(), testRoomType.getId(), "Guest 2", "g2@test.com", stay1CheckIn, stay1CheckOut));

        // Stay 2 is consecutive (starts on checkout day of Stay 1). It must succeed!
        assertDoesNotThrow(() -> {
            bookingService.createBooking(new BookingRequestDto(
                    testHotel.getId(), testRoomType.getId(), "Guest 3", "g3@test.com", stay2CheckIn, stay2CheckOut));
        });
    }

    @Test
    @DisplayName("Integration: Full booking lifecycle - creation, full capacity check, cancellation, and rebooking")
    void testBookingLifecycleAndCapacityRelease() {
        LocalDate checkIn = LocalDate.now().plusDays(2);
        LocalDate checkOut = LocalDate.now().plusDays(5);

        // Capacity is 2 rooms. Book 1st room
        BookingResponseDto b1 = bookingService.createBooking(new BookingRequestDto(
                testHotel.getId(), testRoomType.getId(), "Alice", "alice@test.com", checkIn, checkOut));
        assertNotNull(b1.getBookingReference());

        // Book 2nd room
        BookingResponseDto b2 = bookingService.createBooking(new BookingRequestDto(
                testHotel.getId(), testRoomType.getId(), "Bob", "bob@test.com", checkIn, checkOut));
        assertNotNull(b2.getBookingReference());

        // Attempting to book 3rd room should fail
        assertThrows(RoomUnavailableException.class, () -> {
            bookingService.createBooking(new BookingRequestDto(
                    testHotel.getId(), testRoomType.getId(), "Charlie", "charlie@test.com", checkIn, checkOut));
        });

        // Cancel Alice's booking
        BookingResponseDto cancelled = bookingService.cancelBooking(b1.getBookingReference(), "alice@test.com");
        assertEquals(BookingStatus.CANCELLED, cancelled.getBookingStatus());

        // Now Charlie should successfully be able to book the released room!
        BookingResponseDto b3 = bookingService.createBooking(new BookingRequestDto(
                testHotel.getId(), testRoomType.getId(), "Charlie", "charlie@test.com", checkIn, checkOut));
        assertNotNull(b3.getBookingReference());
        assertEquals("Charlie", b3.getGuestName());
    }

    @Test
    @DisplayName("Simultaneous Booking Protection: Concurrent booking attempts cannot overbook capacity")
    void testConcurrentBookingsCannotOverbook() throws InterruptedException {
        // Create a hotel with only 1 room available
        Hotel singleHotel = hotelRepository.save(new Hotel(null, "Single Room Hotel", "Pune", "Desc", "img.jpg"));
        RoomType singleRoom = roomTypeRepository.save(new RoomType(null, singleHotel, "Single Suite", BigDecimal.valueOf(2500), 1, "WiFi"));

        LocalDate checkIn = LocalDate.now().plusDays(20);
        LocalDate checkOut = LocalDate.now().plusDays(23);

        int numberOfConcurrentThreads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfConcurrentThreads);
        CountDownLatch startGate = new CountDownLatch(1);
        CountDownLatch endGate = new CountDownLatch(numberOfConcurrentThreads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        for (int i = 1; i <= numberOfConcurrentThreads; i++) {
            final int guestId = i;
            executor.submit(() -> {
                try {
                    startGate.await(); // wait for both threads to be ready
                    bookingService.createBooking(new BookingRequestDto(
                            singleHotel.getId(),
                            singleRoom.getId(),
                            "User " + guestId,
                            "user" + guestId + "@test.com",
                            checkIn,
                            checkOut
                    ));
                    successCount.incrementAndGet();
                } catch (RoomUnavailableException e) {
                    failureCount.incrementAndGet();
                } catch (Exception e) {
                    // unexpected error
                } finally {
                    endGate.countDown();
                }
            });
        }

        // Fire both concurrent requests at the exact same instant
        startGate.countDown();
        boolean completed = endGate.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(completed, "Concurrent booking threads should complete in time");
        assertEquals(1, successCount.get(), "Exactly one concurrent request must succeed for the 1 available room");
        assertEquals(1, failureCount.get(), "The other concurrent request must be rejected with RoomUnavailableException");

        // Verify total confirmed bookings in database is exactly 1
        int confirmedInDb = bookingRepository.countOverlappingConfirmedBookings(
                singleRoom.getId(), BookingStatus.CONFIRMED, checkIn, checkOut);
        assertEquals(1, confirmedInDb, "Database must strictly have exactly 1 confirmed booking, never overbooked!");
    }
}
