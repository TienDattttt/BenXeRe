package com.backend.benxere.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleIssueRequest {
    private String issueType;  // MECHANICAL, TRAFFIC, PASSENGER, ACCIDENT, OTHER
    private String issueDescription;
    private String issueSeverity;  // LOW, MEDIUM, HIGH, CRITICAL
    private Double locationLatitude;
    private Double locationLongitude;
    private String locationDescription;
}