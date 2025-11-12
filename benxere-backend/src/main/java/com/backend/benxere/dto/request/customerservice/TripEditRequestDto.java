package com.backend.benxere.dto.request.customerservice;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripEditRequestDto {
    private int bookingId;
    private Integer newScheduleId;
    private LocalDateTime newDepartureTime;
    private Integer newSeatNumber;
    private String editReason;
}