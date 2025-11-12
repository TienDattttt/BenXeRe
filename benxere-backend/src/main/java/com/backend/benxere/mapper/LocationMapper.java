package com.backend.benxere.mapper;

import com.backend.benxere.dto.request.PickupDropoffLocationCreationRequest;
import com.backend.benxere.dto.response.PickupDropoffLocationResponse;
import com.backend.benxere.entity.Location;

public class LocationMapper {

    public PickupDropoffLocationResponse toResponse(Location location) {
        if (location == null) {
            return null;
        }
        return PickupDropoffLocationResponse.builder()
                .locationId(location.getLocationId())
                .name(location.getName())
                .createdAt(location.getCreatedAt())
                .build();
    }

    public Location toEntity(PickupDropoffLocationCreationRequest request) {
        if (request == null) {
            return null;
        }
        Location location = new Location();
        location.setName(request.getName());
        return location;
    }

    public PickupDropoffLocationCreationRequest toCreationRequest(Location location) {
        if (location == null) {
            return null;
        }
        PickupDropoffLocationCreationRequest request = new PickupDropoffLocationCreationRequest();
        request.setName(location.getName());
        return request;
    }
}