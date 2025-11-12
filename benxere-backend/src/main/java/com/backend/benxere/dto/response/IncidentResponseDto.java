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
public class IncidentResponseDto {
    private int incidentId;
    private int scheduleId;
    private String routeName;
    private int driverId;
    private String driverName;
    private String incidentType;
    private String description;
    private String severity;
    private double latitude;
    private double longitude;
    private String address;
    private boolean requiresAssistance;
    private String status; // REPORTED, ACKNOWLEDGED, RESOLVED
    private LocalDateTime reportedAt;
    private LocalDateTime resolvedAt;
}