package com.backend.benxere.mapper;

import com.backend.benxere.dto.response.RoleResponse;
import com.backend.benxere.entity.Role;
import org.mapstruct.Mapper;

import com.backend.benxere.dto.request.RoleRequest;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);
}