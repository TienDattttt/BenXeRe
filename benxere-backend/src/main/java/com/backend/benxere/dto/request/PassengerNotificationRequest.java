package com.backend.benxere.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PassengerNotificationRequest {
    private String message;
    private String notificationType; // DELAY, ARRIVAL, DEPARTURE, GENERAL
    private Integer estimatedMinutes; // For delay/arrival notifications
    private boolean notifyAll; // Send to all passengers
    private Integer specificBookingId; // Send to specific passenger
}