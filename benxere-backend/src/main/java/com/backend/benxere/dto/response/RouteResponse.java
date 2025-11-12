package com.backend.benxere.dto.response;

import lombok.Data;

import java.sql.Timestamp;

@Data
public class RouteResponse {
    private int routeId;
    private String origin;
    private String destination;
    private double distanceKm;
    private Timestamp createdAt;
}