package com.hotelbooking.dto;

import java.math.BigDecimal;

public class RoomTypeDto {
    private Long id;
    private Long hotelId;
    private String roomName;
    private BigDecimal pricePerNight;
    private Integer totalRooms;
    private String amenities;

    public RoomTypeDto() {}

    public RoomTypeDto(Long id, Long hotelId, String roomName, BigDecimal pricePerNight, Integer totalRooms, String amenities) {
        this.id = id;
        this.hotelId = hotelId;
        this.roomName = roomName;
        this.pricePerNight = pricePerNight;
        this.totalRooms = totalRooms;
        this.amenities = amenities;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getHotelId() {
        return hotelId;
    }

    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public BigDecimal getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(BigDecimal pricePerNight) {
        this.pricePerNight = pricePerNight;
    }

    public Integer getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(Integer totalRooms) {
        this.totalRooms = totalRooms;
    }

    public String getAmenities() {
        return amenities;
    }

    public void setAmenities(String amenities) {
        this.amenities = amenities;
    }
}
