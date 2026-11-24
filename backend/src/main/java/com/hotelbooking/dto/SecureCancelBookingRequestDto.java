package com.hotelbooking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class SecureCancelBookingRequestDto {

    @NotBlank(message = "Booking reference is required")
    @Pattern(regexp = "^THB-\\d{8}-[A-F0-9]{6}$", message = "Invalid booking reference format")
    private String bookingReference;

    @NotBlank(message = "Guest email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Verification session token is required")
    private String verificationToken;

    public SecureCancelBookingRequestDto() {}

    public SecureCancelBookingRequestDto(String bookingReference, String email, String verificationToken) {
        this.bookingReference = bookingReference;
        this.email = email;
        this.verificationToken = verificationToken;
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

    public String getVerificationToken() {
        return verificationToken;
    }

    public void setVerificationToken(String verificationToken) {
        this.verificationToken = verificationToken != null ? verificationToken.trim() : null;
    }
}
