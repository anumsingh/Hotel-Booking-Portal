package com.hotelbooking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.hotelbooking.dto.BookingRequestDto;
import com.hotelbooking.dto.BookingResponseDto;
import com.hotelbooking.dto.CancelBookingRequestDto;
import com.hotelbooking.dto.EstimateRequestDto;
import com.hotelbooking.dto.EstimateResponseDto;
import com.hotelbooking.entity.BookingStatus;
import com.hotelbooking.exception.GlobalExceptionHandler;
import com.hotelbooking.service.BookingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private BookingController bookingController;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        mockMvc = MockMvcBuilders.standaloneSetup(bookingController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /api/bookings - Create booking returns 201 CREATED")
    void testCreateBookingSuccess() throws Exception {
        LocalDate checkIn = LocalDate.now().plusDays(3);
        LocalDate checkOut = LocalDate.now().plusDays(6);

        BookingRequestDto request = new BookingRequestDto(1L, 1L, "John Doe", "john@example.com", checkIn, checkOut);

        BookingResponseDto response = new BookingResponseDto();
        response.setId(10L);
        response.setBookingReference("THB-20261123-ABC123");
        response.setGuestName("John Doe");
        response.setGuestEmail("john@example.com");
        response.setHotelName("Grand Palace Hotel");
        response.setBookingStatus(BookingStatus.CONFIRMED);
        response.setNumberOfNights(3);
        response.setTotalAmount(BigDecimal.valueOf(15000));

        when(bookingService.createBooking(any(BookingRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.bookingReference").value("THB-20261123-ABC123"))
                .andExpect(jsonPath("$.guestName").value("John Doe"))
                .andExpect(jsonPath("$.bookingStatus").value("CONFIRMED"));
    }

    @Test
    @DisplayName("POST /api/bookings - Validation error on invalid email and blank name returns 400")
    void testCreateBookingValidationFailure() throws Exception {
        LocalDate checkIn = LocalDate.now().plusDays(3);
        LocalDate checkOut = LocalDate.now().plusDays(6);

        BookingRequestDto invalidRequest = new BookingRequestDto(1L, 1L, "", "not-an-email", checkIn, checkOut);

        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("GET /api/bookings/{reference}?email=... - Retrieve booking")
    void testGetBookingByReferenceAndEmail() throws Exception {
        String ref = "THB-20261123-ABC123";
        String email = "john@example.com";

        BookingResponseDto response = new BookingResponseDto();
        response.setBookingReference(ref);
        response.setGuestEmail(email);
        response.setGuestName("John Doe");
        response.setBookingStatus(BookingStatus.CONFIRMED);

        when(bookingService.getBookingByReferenceAndEmail(ref, email)).thenReturn(response);

        mockMvc.perform(get("/api/bookings/" + ref)
                .param("email", email)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookingReference").value(ref))
                .andExpect(jsonPath("$.guestEmail").value(email));
    }

    @Test
    @DisplayName("PUT /api/bookings/{reference}/cancel - Cancel booking")
    void testCancelBooking() throws Exception {
        String ref = "THB-20261123-ABC123";
        String email = "john@example.com";

        CancelBookingRequestDto cancelReq = new CancelBookingRequestDto(email);

        BookingResponseDto response = new BookingResponseDto();
        response.setBookingReference(ref);
        response.setGuestEmail(email);
        response.setBookingStatus(BookingStatus.CANCELLED);

        when(bookingService.cancelBooking(ref, email)).thenReturn(response);

        mockMvc.perform(put("/api/bookings/" + ref + "/cancel")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cancelReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookingStatus").value("CANCELLED"));
    }

    @Test
    @DisplayName("POST /api/bookings/estimate - Calculate booking estimate")
    void testCalculateEstimate() throws Exception {
        LocalDate checkIn = LocalDate.now().plusDays(3);
        LocalDate checkOut = LocalDate.now().plusDays(5);

        EstimateRequestDto request = new EstimateRequestDto(1L, checkIn, checkOut);

        EstimateResponseDto response = new EstimateResponseDto();
        response.setHotelId(1L);
        response.setNumberOfNights(2);
        response.setPricePerNight(BigDecimal.valueOf(5000));
        response.setTotalAmount(BigDecimal.valueOf(10000));
        response.setIsAvailable(true);
        response.setAvailableRooms(4);

        when(bookingService.calculateEstimate(any(EstimateRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/bookings/estimate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.numberOfNights").value(2))
                .andExpect(jsonPath("$.totalAmount").value(10000));
    }
}
