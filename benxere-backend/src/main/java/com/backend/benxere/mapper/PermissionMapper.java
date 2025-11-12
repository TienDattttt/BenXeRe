package com.backend.benxere.mapper;

import com.backend.benxere.dto.response.PermissionResponse;
import org.mapstruct.Mapper;

import com.backend.benxere.dto.request.PermissionRequest;
import com.backend.benxere.entity.Permission;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest request);

    PermissionResponse toPermissionResponse(Permission permission);
}
