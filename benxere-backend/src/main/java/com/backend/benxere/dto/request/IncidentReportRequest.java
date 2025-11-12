package com.backend.benxere.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IncidentReportRequest {
    private int scheduleId;
    private String incidentType; // MECHANICAL, TRAFFIC, WEATHER, PASSENGER, OTHER
    private String description;
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL
    private double latitude;
    private double longitude;
    private String address;
    private boolean requiresAssistance;
}