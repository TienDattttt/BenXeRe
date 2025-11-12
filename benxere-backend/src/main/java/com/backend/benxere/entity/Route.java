package com.backend.benxere.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "routes")
public class Route {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "route_id")
    int routeId;

    @Column(name = "origin", nullable = false)
    String origin;

    @Column(name = "destination", nullable = false)
    String destination;

    @Column(name = "distance_km", nullable = false)
    double distanceKm;

    @Column(name = "created_at", nullable = false, updatable = false)
    Timestamp createdAt;
}