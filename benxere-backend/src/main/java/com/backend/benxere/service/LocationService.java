package com.backend.benxere.service;

import com.backend.benxere.dto.request.PickupDropoffLocationCreationRequest;
import com.backend.benxere.dto.response.LocationResponse;
import com.backend.benxere.dto.response.PickupDropoffLocationResponse;
import com.backend.benxere.entity.Location;
import com.backend.benxere.mapper.LocationMapper;
import com.backend.benxere.repository.LocationRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LocationService {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final LocationRepository locationRepository;
    private final LocationMapper locationMapper = new LocationMapper();
    private final ScheduleService scheduleService;

    public LocationService(LocationRepository locationRepository, ScheduleService scheduleService) {
        this.locationRepository = locationRepository;
        this.scheduleService = scheduleService;
    }

    public List<LocationResponse> getDistricts() throws IOException {
        InputStream inputStream = getClass().getResourceAsStream("/quan_huyen.json");
        return objectMapper.readValue(inputStream, objectMapper.getTypeFactory().constructCollectionType(List.class, LocationResponse.class));
    }    public List<LocationResponse> getProvinces() throws IOException {
        InputStream inputStream = getClass().getResourceAsStream("/tinh_tp.json");
        JsonNode provincesNode = objectMapper.readTree(inputStream);
        
        List<LocationResponse> provinces = new ArrayList<>();
        provincesNode.fieldNames().forEachRemaining(code -> {
            JsonNode provinceNode = provincesNode.get(code);
            LocationResponse province = new LocationResponse();
            province.setCode(provinceNode.get("code").asText());
            province.setName(provinceNode.get("name").asText());
            province.setSlug(provinceNode.get("slug").asText());
            province.setType(provinceNode.get("type").asText());
            province.setNameWithType(provinceNode.get("name_with_type").asText());
            provinces.add(province);
        });
        
        return provinces;
    }public LocationResponse getProvinceByCode(String provinceCode) throws IOException {
        InputStream inputStream = getClass().getResourceAsStream("/tinh_tp.json");
        JsonNode provincesNode = objectMapper.readTree(inputStream);
        
        JsonNode provinceNode = provincesNode.get(provinceCode);
        if (provinceNode != null) {
            LocationResponse province = new LocationResponse();
            province.setCode(provinceNode.get("code").asText());
            province.setName(provinceNode.get("name").asText());
            province.setSlug(provinceNode.get("slug").asText());
            province.setType(provinceNode.get("type").asText());
            province.setNameWithType(provinceNode.get("name_with_type").asText());
            return province;
        }
        return null;
    }

    public LocationResponse getDistrictByCode(String districtCode) throws IOException {
        InputStream inputStream = getClass().getResourceAsStream("/quan_huyen.json");
        List<LocationResponse> districts = objectMapper.readValue(inputStream, objectMapper.getTypeFactory().constructCollectionType(List.class, LocationResponse.class));
        return districts.stream().filter(district -> district.getCode().equals(districtCode)).findFirst().orElse(null);
    }
    public List<PickupDropoffLocationResponse> getAllLocations() {
        return locationRepository.findAll().stream()
                .map(locationMapper::toResponse)
                .collect(Collectors.toList());
    }

    public PickupDropoffLocationResponse getLocationById(int id) {
        return locationRepository.findById(id)
                .map(locationMapper::toResponse)
                .orElse(null);
    }

    public PickupDropoffLocationResponse createLocation(PickupDropoffLocationCreationRequest request) {
        Location location = locationMapper.toEntity(request);
        location.setCreatedAt(Timestamp.from(java.time.Instant.now()));
        location = locationRepository.save(location);
        return locationMapper.toResponse(location);
    }

    public PickupDropoffLocationResponse updateLocation(int id, PickupDropoffLocationCreationRequest request) {
        return locationRepository.findById(id)
                .map(existingLocation -> {
                    existingLocation.setName(request.getName());
                    Location updatedLocation = locationRepository.save(existingLocation);
                    return locationMapper.toResponse(updatedLocation);
                })
                .orElse(null);
    }

    public void deleteLocation(int id) {
        locationRepository.deleteById(id);
    }
    public List<PickupDropoffLocationResponse> getLocationRecommendations(String query) {
        List<Location> locations = locationRepository.findByQuery(query);
        return locations.stream()
                .map(location -> new PickupDropoffLocationResponse(location.getLocationId(), location.getName()))
                .collect(Collectors.toList());
    }
    public List<PickupDropoffLocationResponse> getPickUpSchedules(int id) {
        return scheduleService.getPickUpLocationsByScheduleId(id);
    }
    public List<PickupDropoffLocationResponse> getDropOffSchedules(int id) {
        return scheduleService.getDropOffLocationsByScheduleId(id);
    }
}