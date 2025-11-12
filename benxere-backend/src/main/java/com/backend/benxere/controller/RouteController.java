package com.backend.benxere.controller;

import com.backend.benxere.dto.request.RouteRequest;
import com.backend.benxere.dto.response.RouteResponse;
import com.backend.benxere.service.RouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    @Autowired
    private RouteService routeService;

    @GetMapping("/all")
    public List<RouteResponse> getAllRoutes() {
        return routeService.getAllRoutes();
    }

    @PostMapping("/create")
    public RouteResponse createRoute(@RequestBody RouteRequest routeRequest) {
        return routeService.createRoute(routeRequest);
    }
    @GetMapping("/{id}")
    public RouteResponse getRouteById(@PathVariable int id) {
        return routeService.getRouteById(id);
    }
    @DeleteMapping("/{id}")
    public void deleteRoute(@PathVariable int id) {
        try {
            routeService.deleteRoute(id);
        } catch (Exception e) {
            System.err.println("Error deleting route: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error deleting route", e);
        }
    }

    @GetMapping("/{origin}/{destination}")
    public RouteResponse getRouteByOriginAndDestination(@PathVariable String origin, @PathVariable String destination) {
        try {
            return routeService.getRouteByOriginAndDestination(origin, destination);
        } catch (Exception e) {
            System.err.println("Error fetching route by origin and destination: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching route", e);
        }
    }
}