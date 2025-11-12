package com.backend.benxere.mapper;

import com.backend.benxere.dto.request.RouteRequest;
import com.backend.benxere.dto.response.RouteResponse;
import com.backend.benxere.entity.Route;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RouteMapper {

    @Mapping(target = "routeId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Route toEntity(RouteRequest routeRequest);

    RouteResponse toResponse(Route route);
}