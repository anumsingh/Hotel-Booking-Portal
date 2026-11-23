package com.hotelbooking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class CancelBookingRequestDto {

    @NotBlank(message = "Email is required to verify booking cancellation")
    @Email(message = "Please provide a valid email address")
    private String email;

    public CancelBookingRequestDto() {}

    public CancelBookingRequestDto(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
