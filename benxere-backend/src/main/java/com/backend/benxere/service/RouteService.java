package com.backend.benxere.service;

import com.backend.benxere.dto.request.RouteRequest;
import com.backend.benxere.dto.response.RouteResponse;
import com.backend.benxere.entity.Route;
import com.backend.benxere.repository.RouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RouteService {

    @Autowired
    private RouteRepository routeRepository;

    public List<RouteResponse> getAllRoutes() {
        List<Route> routes = routeRepository.findAll();
        return routes.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public RouteResponse createRoute(RouteRequest routeRequest) {
        Route route = new Route();
        route.setOrigin(routeRequest.getOrigin());
        route.setDestination(routeRequest.getDestination());
        route.setDistanceKm(routeRequest.getDistanceKm());
        route.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        routeRepository.save(route);
        return convertToResponse(route);
    }

    private RouteResponse convertToResponse(Route route) {
        RouteResponse response = new RouteResponse();
        response.setRouteId(route.getRouteId());
        response.setOrigin(route.getOrigin());
        response.setDestination(route.getDestination());
        response.setDistanceKm(route.getDistanceKm());
        response.setCreatedAt(route.getCreatedAt());
        return response;
    }
    public RouteResponse getRouteById(int id) {
        Route route = routeRepository.findById(id).orElseThrow(() -> new RuntimeException("Route not found"));
        return convertToResponse(route);
    }
    public RouteResponse getRouteByOriginAndDestination(String origin, String destination) {
        Route route = routeRepository.findRouteByOriginAndDestination(origin, destination);
        if (route == null) {
            route = new Route();
            route.setOrigin(origin);
            route.setDestination(destination);
            route.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            routeRepository.save(route);
        }
        return convertToResponse(route);
    }
    public void deleteRoute(int id) {
        Route route = routeRepository.findById(id).orElseThrow(() -> new RuntimeException("Route not found"));
        routeRepository.delete(route);
    }
}