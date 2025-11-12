package com.backend.benxere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationStopResponse {
    private int locationId;
    private String locationName;
    private String address;
    private double latitude;
    private double longitude;
    private boolean isPickup;
    private boolean isDropoff;
    private int passengerCount;
}