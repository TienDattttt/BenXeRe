package com.backend.benxere.controller;

import com.backend.benxere.dto.request.PickupDropoffLocationCreationRequest;
import com.backend.benxere.dto.response.LocationResponse;
import com.backend.benxere.dto.response.PickupDropoffLocationResponse;
import com.backend.benxere.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    @Autowired
    private LocationService locationService;

    @GetMapping("/districts")
    public List<LocationResponse> getDistricts() throws IOException {
        return locationService.getDistricts();
    }

    @GetMapping("/provinces")
    public List<LocationResponse> getProvinces() throws IOException {
        return locationService.getProvinces();
    }

    @GetMapping("/province/{provinceCode}")
    public LocationResponse getProvinceByCode(@PathVariable String provinceCode) throws IOException {
        return locationService.getProvinceByCode(provinceCode);
    }

    @GetMapping("/district/{districtCode}")
    public LocationResponse getDistrictByCode(@PathVariable String districtCode) throws IOException {
        return locationService.getDistrictByCode(districtCode);
    }

    @GetMapping
    public List<PickupDropoffLocationResponse> getAllLocations() {
        return locationService.getAllLocations();
    }

    @GetMapping("/{id}")
    public PickupDropoffLocationResponse getLocationById(@PathVariable int id) {
        return locationService.getLocationById(id);
    }

    @PostMapping
    public PickupDropoffLocationResponse createLocation(@RequestBody PickupDropoffLocationCreationRequest request) {
        return locationService.createLocation(request);
    }

    @PutMapping("/{id}")
    public PickupDropoffLocationResponse updateLocation(@PathVariable int id, @RequestBody PickupDropoffLocationCreationRequest request) {
        return locationService.updateLocation(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteLocation(@PathVariable int id) {
        locationService.deleteLocation(id);
    }
    @GetMapping("/recommendations")
    public List<PickupDropoffLocationResponse> getLocationRecommendations(@RequestParam String query) {
        return locationService.getLocationRecommendations(query);
    }
    @GetMapping("/pick-up/schedules/{id}")
    public List<PickupDropoffLocationResponse> getPickUpSchedules(@PathVariable int id) {
        return locationService.getPickUpSchedules(id);
    }
    @GetMapping("/drop-off/schedules/{id}")
    public List<PickupDropoffLocationResponse> getDropOffSchedules(@PathVariable int id) {
        return locationService.getDropOffSchedules(id);
    }

}