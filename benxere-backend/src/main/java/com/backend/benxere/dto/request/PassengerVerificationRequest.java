package com.backend.benxere.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PassengerVerificationRequest {
    private String qrCode;
    private String phoneNumber;
    private Integer bookingId;
    private Integer scheduleId;
    private Integer seatId;
    private Boolean isBoarded;
    private Boolean isDisembarked;
    private String verificationMethod;
    private Integer luggageCount;
    private String luggageTags;
}