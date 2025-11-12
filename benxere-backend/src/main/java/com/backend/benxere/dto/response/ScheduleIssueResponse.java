package com.backend.benxere.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleIssueResponse {
    private int issueId;
    private int scheduleId;
    private String reportedByUsername;
    private String issueType;
    private String issueDescription;
    private String issueSeverity;
    private String issueStatus;
    private Double locationLatitude;
    private Double locationLongitude;
    private String locationDescription;
    private String resolutionNotes;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime resolvedAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
}