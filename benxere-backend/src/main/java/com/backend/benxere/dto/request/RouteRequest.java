package com.backend.benxere.dto.request;

import lombok.Data;

@Data
public class RouteRequest {
    private String origin;
    private String destination;
    private double distanceKm;
}