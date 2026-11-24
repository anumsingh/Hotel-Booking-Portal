package com.hotelbooking.dto;

public class BookingLookupResponseDto {

    private String message;
    private BookingDataDto data;
    private String verificationToken;

    public BookingLookupResponseDto() {}

    public BookingLookupResponseDto(String message, BookingDataDto data, String verificationToken) {
        this.message = message;
        this.data = data;
        this.verificationToken = verificationToken;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public BookingDataDto getData() {
        return data;
    }

    public void setData(BookingDataDto data) {
        this.data = data;
    }

    public String getVerificationToken() {
        return verificationToken;
    }

    public void setVerificationToken(String verificationToken) {
        this.verificationToken = verificationToken;
    }
}
