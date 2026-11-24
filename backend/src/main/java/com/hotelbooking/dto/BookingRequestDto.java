package com.hotelbooking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class BookingRequestDto {

    @NotNull(message = "Hotel ID is required")
    @Positive(message = "Hotel ID must be a positive integer")
    private Long hotelId;

    @NotNull(message = "Room Type ID is required")
    @Positive(message = "Room Type ID must be a positive integer")
    private Long roomTypeId;

    @NotBlank(message = "Guest name is required")
    @Size(min = 2, max = 80, message = "Guest name must be between 2 and 80 characters")
    @Pattern(regexp = "^[a-zA-Z\\s.'\\-]+$", message = "Guest name contains invalid characters")
    private String guestName;

    @NotBlank(message = "Guest email is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 120, message = "Email address cannot exceed 120 characters")
    private String guestEmail;

    @NotNull(message = "Check-in date is required")
    private LocalDate checkInDate;

    @NotNull(message = "Check-out date is required")
    private LocalDate checkOutDate;

    public BookingRequestDto() {}

    public BookingRequestDto(Long hotelId, Long roomTypeId, String guestName, String guestEmail, LocalDate checkInDate, LocalDate checkOutDate) {
        this.hotelId = hotelId;
        this.roomTypeId = roomTypeId;
        this.guestName = guestName;
        this.guestEmail = guestEmail;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
    }

    public Long getHotelId() {
        return hotelId;
    }

    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }

    public Long getRoomTypeId() {
        return roomTypeId;
    }

    public void setRoomTypeId(Long roomTypeId) {
        this.roomTypeId = roomTypeId;
    }

    public String getGuestName() {
        return guestName;
    }

    public void setGuestName(String guestName) {
        this.guestName = guestName;
    }

    public String getGuestEmail() {
        return guestEmail;
    }

    public void setGuestEmail(String guestEmail) {
        this.guestEmail = guestEmail;
    }

    public LocalDate getCheckInDate() {
        return checkInDate;
    }

    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
    }

    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }

    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
    }
}
