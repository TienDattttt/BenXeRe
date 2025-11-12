package com.backend.benxere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripDetailResponseDto {
    private int tripId;
    private int scheduleId;
    private int routeId;
    private String routeName;
    private String origin;
    private String destination;
    private double distanceKm;
    private int busId;
    private String busPlate;
    private String busModel;
    private int capacity;
    private int occupiedSeats;
    private int driverId;
    private String driverName;
    private Integer assistantId;
    private String assistantName;
    private LocalDateTime departureTime;
    private LocalDateTime estimatedArrivalTime;
    private LocalDateTime actualArrivalTime;
    private String status;
    private LocationDto currentLocation;
    private LocationDto startLocation;
    private LocationDto endLocation;
    private List<WaypointDto> waypoints;
    private List<PassengerInfoResponse> passengers;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocationDto {
        private int locationId;
        private String name;
        private String address;
        private double latitude;
        private double longitude;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WaypointDto {
        private int waypointId;
        private String name;
        private String address;
        private double latitude;
        private double longitude;
        private int sequenceNumber;
        private LocalDateTime estimatedArrivalTime;
        private boolean isStop; // Whether bus stops at this waypoint
    }
}