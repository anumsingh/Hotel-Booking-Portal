package com.hotelbooking.service;

import com.hotelbooking.dto.AlternativeHotelDto;
import com.hotelbooking.dto.AvailabilityResponseDto;
import com.hotelbooking.dto.HotelDto;
import com.hotelbooking.dto.RoomTypeDto;
import com.hotelbooking.entity.BookingStatus;
import com.hotelbooking.entity.Hotel;
import com.hotelbooking.entity.RoomType;
import com.hotelbooking.exception.InvalidBookingDatesException;
import com.hotelbooking.exception.ResourceNotFoundException;
import com.hotelbooking.repository.BookingRepository;
import com.hotelbooking.repository.HotelRepository;
import com.hotelbooking.repository.RoomTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class HotelService {

    private final HotelRepository hotelRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final BookingRepository bookingRepository;

    public HotelService(HotelRepository hotelRepository,
                        RoomTypeRepository roomTypeRepository,
                        BookingRepository bookingRepository) {
        this.hotelRepository = hotelRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<HotelDto> getAllHotels() {
        return hotelRepository.findAll().stream()
                .map(this::mapToHotelDto)
                .collect(Collectors.toList());
    }

    public HotelDto getHotelById(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));
        return mapToHotelDto(hotel);
    }

    public List<HotelDto> searchHotelsByLocation(String location) {
        if (location == null || location.trim().isEmpty()) {
            return getAllHotels();
        }
        return hotelRepository.searchByLocation(location.trim()).stream()
                .map(this::mapToHotelDto)
                .collect(Collectors.toList());
    }

    public AvailabilityResponseDto checkAvailability(Long hotelId, LocalDate checkIn, LocalDate checkOut) {
        validateDates(checkIn, checkOut);

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + hotelId));

        RoomType roomType = roomTypeRepository.findFirstByHotelId(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("No room type configured for hotel id: " + hotelId));

        int bookedRooms = bookingRepository.countOverlappingConfirmedBookings(
                roomType.getId(),
                BookingStatus.CONFIRMED,
                checkIn,
                checkOut
        );

        int availableRooms = Math.max(0, roomType.getTotalRooms() - bookedRooms);
        boolean isAvailable = availableRooms > 0;
        int nights = (int) ChronoUnit.DAYS.between(checkIn, checkOut);
        BigDecimal totalAmount = roomType.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        AvailabilityResponseDto response = new AvailabilityResponseDto();
        response.setHotelId(hotel.getId());
        response.setHotelName(hotel.getName());
        response.setRoomTypeId(roomType.getId());
        response.setRoomName(roomType.getRoomName());
        response.setTotalRooms(roomType.getTotalRooms());
        response.setBookedRooms(bookedRooms);
        response.setAvailableRooms(availableRooms);
        response.setIsAvailable(isAvailable);
        response.setCheckInDate(checkIn);
        response.setCheckOutDate(checkOut);
        response.setNumberOfNights(nights);
        response.setPricePerNight(roomType.getPricePerNight());
        response.setTotalAmount(totalAmount);

        return response;
    }

    /**
     * Smart Alternative Hotel Recommendations:
     * When the selected hotel is fully booked for requested dates,
     * this finds other hotels located in the same city/location,
     * checks their live availability for the exact same check-in/out dates,
     * and returns available alternatives.
     */
    public List<AlternativeHotelDto> getAlternativeHotels(Long hotelId, LocalDate checkIn, LocalDate checkOut) {
        validateDates(checkIn, checkOut);

        Hotel originalHotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + hotelId));

        List<Hotel> sameLocationHotels = hotelRepository.findAlternativesByLocation(
                originalHotel.getLocation(),
                originalHotel.getId()
        );

        List<AlternativeHotelDto> availableAlternatives = new ArrayList<>();

        for (Hotel hotel : sameLocationHotels) {
            RoomType roomType = roomTypeRepository.findFirstByHotelId(hotel.getId()).orElse(null);
            if (roomType == null) {
                continue;
            }

            int booked = bookingRepository.countOverlappingConfirmedBookings(
                    roomType.getId(),
                    BookingStatus.CONFIRMED,
                    checkIn,
                    checkOut
            );

            int availableRooms = roomType.getTotalRooms() - booked;
            if (availableRooms > 0) {
                AlternativeHotelDto alt = new AlternativeHotelDto();
                alt.setHotelId(hotel.getId());
                alt.setHotelName(hotel.getName());
                alt.setLocation(hotel.getLocation());
                alt.setDescription(hotel.getDescription());
                alt.setImageUrl(hotel.getImageUrl());
                alt.setRoomTypeId(roomType.getId());
                alt.setRoomName(roomType.getRoomName());
                alt.setAmenities(roomType.getAmenities());
                alt.setPricePerNight(roomType.getPricePerNight());
                alt.setTotalRooms(roomType.getTotalRooms());
                alt.setAvailableRooms(availableRooms);
                availableAlternatives.add(alt);
            }
        }

        return availableAlternatives;
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

    public HotelDto mapToHotelDto(Hotel hotel) {
        RoomTypeDto roomTypeDto = null;
        RoomType roomType = roomTypeRepository.findFirstByHotelId(hotel.getId()).orElse(null);
        if (roomType != null) {
            roomTypeDto = new RoomTypeDto(
                    roomType.getId(),
                    hotel.getId(),
                    roomType.getRoomName(),
                    roomType.getPricePerNight(),
                    roomType.getTotalRooms(),
                    roomType.getAmenities()
            );
        }

        return new HotelDto(
                hotel.getId(),
                hotel.getName(),
                hotel.getLocation(),
                hotel.getDescription(),
                hotel.getImageUrl(),
                roomTypeDto
        );
    }
}
