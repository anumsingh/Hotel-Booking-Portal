package com.hotelbooking.repository;

import com.hotelbooking.entity.RoomType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Long> {

    List<RoomType> findByHotelId(Long hotelId);

    Optional<RoomType> findFirstByHotelId(Long hotelId);

    /**
     * Pessimistic Write Lock (SELECT ... FOR UPDATE) to prevent concurrent overbooking.
     * Guarantees exclusive transaction isolation while checking availability and saving booking.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM RoomType r WHERE r.id = :id")
    Optional<RoomType> findByIdWithLock(@Param("id") Long id);
}
