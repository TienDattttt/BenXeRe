package com.backend.benxere.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatUpdateRequest {
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private String passengerStatus;
    private String driverNotes;
    private Integer baggageCount;
}