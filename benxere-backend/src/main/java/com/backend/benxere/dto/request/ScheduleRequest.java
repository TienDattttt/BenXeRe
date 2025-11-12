package com.backend.benxere.dto.request;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ScheduleRequest {
    private int busId;
    private int routeId;
    private int driverId;
    private int secondDriverId;
    private int assistantId;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private double pricePerSeat;
    private List<Integer> pickUpLocationIds;
    private List<Integer> dropOffLocationIds;
}