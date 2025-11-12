package com.backend.benxere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleDetailResponseDto {
    private int scheduleId;
    private String status; // PENDING, ACTIVE, COMPLETED, DELAYED, CANCELLED
    private LocalDateTime departureTime;
    private LocalDateTime estimatedArrivalTime;
    private LocalDateTime actualDepartureTime;
    private LocalDateTime actualArrivalTime;
    private String routeName;
    private double distance;
    private String currentLocation;
    private double currentLatitude;
    private double currentLongitude;
    private String delayReason;
    private String cancellationReason;
    private Map<String, Object> busDetails;
    private List<LocationStopResponse> stops;
    private List<PassengerInfoResponse> passengers;
    private int totalPassengers;
    private int boardedPassengers;
}