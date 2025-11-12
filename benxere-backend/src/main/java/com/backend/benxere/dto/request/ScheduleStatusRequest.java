package com.backend.benxere.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleStatusRequest {
    private String status;  // SCHEDULED, STARTED, FINISHED, CANCELLED
}