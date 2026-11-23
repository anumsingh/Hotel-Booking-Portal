package com.hotelbooking.controller;

import com.hotelbooking.dto.AlternativeHotelDto;
import com.hotelbooking.dto.AvailabilityResponseDto;
import com.hotelbooking.dto.HotelDto;
import com.hotelbooking.dto.RoomTypeDto;
import com.hotelbooking.exception.GlobalExceptionHandler;
import com.hotelbooking.service.HotelService;
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
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class HotelControllerTest {

    private MockMvc mockMvc;

    @Mock
    private HotelService hotelService;

    @InjectMocks
    private HotelController hotelController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(hotelController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/hotels - Retrieve all hotels")
    void testGetAllHotels() throws Exception {
        RoomTypeDto room = new RoomTypeDto(1L, 1L, "Deluxe Suite", BigDecimal.valueOf(4000), 5, "WiFi, Pool");
        HotelDto hotel = new HotelDto(1L, "Grand Palace Hotel", "Mumbai", "Description", "img.jpg", room);

        when(hotelService.getAllHotels()).thenReturn(List.of(hotel));

        mockMvc.perform(get("/api/hotels")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Grand Palace Hotel"))
                .andExpect(jsonPath("$[0].location").value("Mumbai"));
    }

    @Test
    @DisplayName("GET /api/hotels/search?location=Mumbai - Search hotels by location")
    void testSearchHotelsByLocation() throws Exception {
        RoomTypeDto room = new RoomTypeDto(1L, 1L, "Deluxe Suite", BigDecimal.valueOf(4000), 5, "WiFi, Pool");
        HotelDto hotel = new HotelDto(1L, "Grand Palace Hotel", "Mumbai", "Description", "img.jpg", room);

        when(hotelService.searchHotelsByLocation("Mumbai")).thenReturn(List.of(hotel));

        mockMvc.perform(get("/api/hotels/search")
                .param("location", "Mumbai")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Grand Palace Hotel"));
    }

    @Test
    @DisplayName("GET /api/hotels/{id}/availability - Check availability")
    void testCheckAvailabilityEndpoint() throws Exception {
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = LocalDate.now().plusDays(7);

        AvailabilityResponseDto response = new AvailabilityResponseDto();
        response.setHotelId(1L);
        response.setHotelName("Grand Palace Hotel");
        response.setTotalRooms(5);
        response.setAvailableRooms(3);
        response.setIsAvailable(true);
        response.setCheckInDate(checkIn);
        response.setCheckOutDate(checkOut);
        response.setNumberOfNights(2);
        response.setPricePerNight(BigDecimal.valueOf(4000));
        response.setTotalAmount(BigDecimal.valueOf(8000));

        when(hotelService.checkAvailability(eq(1L), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(response);

        mockMvc.perform(get("/api/hotels/1/availability")
                .param("checkIn", checkIn.toString())
                .param("checkOut", checkOut.toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hotelName").value("Grand Palace Hotel"))
                .andExpect(jsonPath("$.availableRooms").value(3))
                .andExpect(jsonPath("$.isAvailable").value(true));
    }

    @Test
    @DisplayName("GET /api/hotels/{id}/alternatives - Retrieve alternative hotels")
    void testGetAlternativesEndpoint() throws Exception {
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = LocalDate.now().plusDays(7);

        AlternativeHotelDto alt = new AlternativeHotelDto();
        alt.setHotelId(2L);
        alt.setHotelName("Marine Bay Luxury Suites");
        alt.setLocation("Mumbai");
        alt.setPricePerNight(BigDecimal.valueOf(4500));
        alt.setAvailableRooms(4);

        when(hotelService.getAlternativeHotels(eq(1L), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(alt));

        mockMvc.perform(get("/api/hotels/1/alternatives")
                .param("checkIn", checkIn.toString())
                .param("checkOut", checkOut.toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].hotelName").value("Marine Bay Luxury Suites"))
                .andExpect(jsonPath("$[0].availableRooms").value(4));
    }
}
