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
public class PassengerInfoResponse {
    private int bookingId;
    private int seatId;
    private String seatNumber;
    private String passengerName;
    private String phoneNumber;
    private String pickupLocationName;
    private String dropoffLocationName;
    private Boolean isBoarded;
    private LocalDateTime boardingTime;
    private Boolean isDisembarked;
    private LocalDateTime disembarkingTime;
    private Integer luggageCount;
    private String luggageTags;
}