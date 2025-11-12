package com.backend.benxere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleSearchResponse {
    private int scheduleId;
    private String busName;
    private String driverName;
    private String secondDriverName;
    private String assistantName;
    private String origin;
    private String destination;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private double pricePerSeat;
    private int availableSeats;
    private int totalSeats;
} 