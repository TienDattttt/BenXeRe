package com.backend.benxere.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripStatusUpdateRequest {
    private int tripId;
    private String status; // STARTED, IN_PROGRESS, COMPLETED, DELAYED, CANCELLED
    private String statusNote;
}