package com.hotelbooking.controller;

import com.hotelbooking.dto.AlternativeHotelDto;
import com.hotelbooking.dto.AvailabilityResponseDto;
import com.hotelbooking.dto.HotelDto;
import com.hotelbooking.service.HotelService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/hotels")
public class HotelController {

    private final HotelService hotelService;

    public HotelController(HotelService hotelService) {
        this.hotelService = hotelService;
    }

    /**
     * Retrieve all hotels.
     * GET /api/hotels
     */
    @GetMapping
    public ResponseEntity<List<HotelDto>> getAllHotels() {
        return ResponseEntity.ok(hotelService.getAllHotels());
    }

    /**
     * Search hotels by location.
     * GET /api/hotels/search?location=Mumbai
     */
    @GetMapping("/search")
    public ResponseEntity<List<HotelDto>> searchHotels(@RequestParam(name = "location", required = false) String location) {
        return ResponseEntity.ok(hotelService.searchHotelsByLocation(location));
    }

    /**
     * Retrieve hotel by ID.
     * GET /api/hotels/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<HotelDto> getHotelById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(hotelService.getHotelById(id));
    }

    /**
     * Check room availability for a hotel and selected dates.
     * GET /api/hotels/{id}/availability?checkIn=2026-12-10&checkOut=2026-12-13
     */
    @GetMapping("/{id}/availability")
    public ResponseEntity<AvailabilityResponseDto> checkAvailability(
            @PathVariable("id") Long id,
            @RequestParam("checkIn") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam("checkOut") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {
        return ResponseEntity.ok(hotelService.checkAvailability(id, checkIn, checkOut));
    }

    /**
     * Surprise Feature: Smart Alternative Hotel Recommendations.
     * GET /api/hotels/{id}/alternatives?checkIn=2026-12-10&checkOut=2026-12-13
     */
    @GetMapping("/{id}/alternatives")
    public ResponseEntity<List<AlternativeHotelDto>> getAlternativeHotels(
            @PathVariable("id") Long id,
            @RequestParam("checkIn") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam("checkOut") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {
        return ResponseEntity.ok(hotelService.getAlternativeHotels(id, checkIn, checkOut));
    }
}
