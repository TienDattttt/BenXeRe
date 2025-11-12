package com.backend.benxere.dto.request;

import lombok.Data;

@Data
public class SeatRequest {
    private int scheduleId;
    private String seatNumber;
    private boolean isBooked;
    private int bookedById;
}