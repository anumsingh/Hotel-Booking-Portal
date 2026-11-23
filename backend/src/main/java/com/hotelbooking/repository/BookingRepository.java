package com.hotelbooking.repository;

import com.hotelbooking.entity.Booking;
import com.hotelbooking.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingReference(String bookingReference);

    Optional<Booking> findByBookingReferenceAndGuestEmailIgnoreCase(String bookingReference, String guestEmail);

    /**
     * Overlap calculation rule:
     * Existing Check-in < Requested Check-out AND Existing Check-out > Requested Check-in.
     * Consecutive bookings (e.g. checkout 15th and checkin 15th) do NOT overlap because
     * existing checkout (15th) is not > requested checkin (15th).
     * Only CONFIRMED bookings reduce available room capacity.
     */
    @Query("SELECT COUNT(b) FROM Booking b " +
           "WHERE b.roomType.id = :roomTypeId " +
           "AND b.bookingStatus = :status " +
           "AND b.checkInDate < :checkOut " +
           "AND b.checkOutDate > :checkIn")
    int countOverlappingConfirmedBookings(
            @Param("roomTypeId") Long roomTypeId,
            @Param("status") BookingStatus status,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );

    @Query("SELECT b FROM Booking b " +
           "WHERE b.roomType.id = :roomTypeId " +
           "AND b.bookingStatus = :status " +
           "AND b.checkInDate < :checkOut " +
           "AND b.checkOutDate > :checkIn")
    List<Booking> findOverlappingConfirmedBookings(
            @Param("roomTypeId") Long roomTypeId,
            @Param("status") BookingStatus status,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );
}
