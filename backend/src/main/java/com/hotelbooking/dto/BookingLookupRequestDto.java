package com.hotelbooking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class BookingLookupRequestDto {

    @NotBlank(message = "Booking reference is required")
    @Pattern(regexp = "^THB-\\d{8}-[A-F0-9]{6}$", message = "Invalid booking reference format. Expected format: THB-YYYYMMDD-XXXXXX")
    private String bookingReference;

    @NotBlank(message = "Guest email is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 120, message = "Email address cannot exceed 120 characters")
    private String email;

    public BookingLookupRequestDto() {}

    public BookingLookupRequestDto(String bookingReference, String email) {
        this.bookingReference = bookingReference;
        this.email = email;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference != null ? bookingReference.trim() : null;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email != null ? email.trim().toLowerCase() : null;
    }
}
