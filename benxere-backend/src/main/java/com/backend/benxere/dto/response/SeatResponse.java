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
public class SeatResponse {
    private int seatId;
    private String seatNumber;
    private boolean isBooked;
    private UserResponse user;
    private LocalDateTime bookedAt;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private String passengerStatus;
    private String driverNotes;
    private Integer baggageCount;
    private Integer lastUpdatedBy;
    private LocalDateTime lastUpdatedAt;
    private String qrCodeData;
    private Integer qrCodeScannedCount;
    private LocalDateTime lastQrScanTime;
}