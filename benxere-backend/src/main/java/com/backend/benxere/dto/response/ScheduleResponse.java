package com.backend.benxere.dto.response;

import lombok.Data;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.List;

@Data
public class ScheduleResponse {
    private int scheduleId;
    private BusResponse bus;
    private UserResponse driver;
    private UserResponse secondDriver;
    private UserResponse assistant;
    private RouteResponse route;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private double pricePerSeat;
    private Set<LocationResponse> locations;
    private List<SeatResponse> seats;
    private List<PickupDropoffLocationResponse> pickUpLocations;
    private List<PickupDropoffLocationResponse> dropOffLocations;
    private Timestamp createdAt;
}