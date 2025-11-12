package com.backend.benxere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverScheduleResponse {
    private int scheduleId;
    private String routeName;
    private String busNumber;
    private String busLicensePlate;
    private int busCapacity;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private String startLocationName;
    private String endLocationName;
    private double pricePerSeat;
    private int bookedSeatsCount;
    private int totalSeatsCount;
    private List<PassengerInfoResponse> passengers;
    private List<LocationStopResponse> stops;
}