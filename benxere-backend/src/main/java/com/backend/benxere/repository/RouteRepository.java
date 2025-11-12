package com.backend.benxere.repository;

import com.backend.benxere.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RouteRepository extends JpaRepository<Route, Integer> {
    Route findRouteByOriginAndDestination(String origin, String destination);
}