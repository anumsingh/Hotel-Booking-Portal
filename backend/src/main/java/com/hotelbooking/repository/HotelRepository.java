package com.hotelbooking.repository;

import com.hotelbooking.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    @Query("SELECT h FROM Hotel h WHERE LOWER(h.location) LIKE LOWER(CONCAT('%', :location, '%'))")
    List<Hotel> searchByLocation(@Param("location") String location);

    @Query("SELECT h FROM Hotel h WHERE LOWER(h.location) = LOWER(:location) AND h.id <> :excludeHotelId")
    List<Hotel> findAlternativesByLocation(@Param("location") String location, @Param("excludeHotelId") Long excludeHotelId);
}
