package com.hotelbooking.exception;

public class InvalidBookingReferenceException extends RuntimeException {
    public InvalidBookingReferenceException(String message) {
        super(message);
    }
}
