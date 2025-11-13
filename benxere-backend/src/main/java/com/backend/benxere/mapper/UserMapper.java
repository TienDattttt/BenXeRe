package com.backend.benxere.mapper;

import com.backend.benxere.dto.request.EmployeeCreationRequest;
import com.backend.benxere.dto.request.UserCreationRequest;
import com.backend.benxere.dto.request.UserUpdateRequest;
import com.backend.benxere.dto.response.UserResponse;
import com.backend.benxere.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.sql.Time;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Mapper(
    componentModel = "spring",
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface UserMapper {
    
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "employer", ignore = true)
    @Mapping(target = "employees", ignore = true)
    @Mapping(target = "createdAt", expression = "java(getCurrentTimestamp())")

    @Mapping(target = "status", expression = "java(\"ACTIVE\")")
    @Mapping(target = "workStartTime", expression = "java(toTime(request.getWorkStartTime()))")
    @Mapping(target = "workEndTime", expression = "java(toTime(request.getWorkEndTime()))")
    User toUser(UserCreationRequest request);
    
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "employer", ignore = true)
    @Mapping(target = "employees", ignore = true)
    @Mapping(target = "createdAt", expression = "java(getCurrentTimestamp())")
    @Mapping(target = "status", constant = "ACTIVE")
    @Mapping(target = "workStartTime", expression = "java(toTime(request.getWorkStartTime()))")
    @Mapping(target = "workEndTime", expression = "java(toTime(request.getWorkEndTime()))")
    User toUser(EmployeeCreationRequest request);

    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "employer", ignore = true)
    @Mapping(target = "employees", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "workStartTime", expression = "java(toTime(dto.getWorkStartTime()))")
    @Mapping(target = "workEndTime", expression = "java(toTime(dto.getWorkEndTime()))")
    void updateUserFromDto(UserUpdateRequest dto, @MappingTarget User user);

    @Mapping(target = "employerId", source = "employer.userId")
    @Mapping(target = "employerEmail", source = "employer.email")
    @Mapping(target = "createdAt", expression = "java(toLocalDateTime(user.getCreatedAt()))")
    @Mapping(target = "role", source = "role.name")
    @Mapping(target = "workStartTime", expression = "java(toLocalTime(user.getWorkStartTime()))")
    @Mapping(target = "workEndTime", expression = "java(toLocalTime(user.getWorkEndTime()))")
    @Mapping(target = "fullName", expression = "java(getFullName(user.getFirstName(), user.getLastName()))")
    @Mapping(target = "profilePictureUrl", expression = "java(getDefaultProfilePicture())")
    UserResponse toUserResponse(User user);

    @Named("getCurrentTimestamp")
    default Timestamp getCurrentTimestamp() {
        return Timestamp.from(java.time.Instant.now());
    }

    @Named("toLocalDateTime")
    default LocalDateTime toLocalDateTime(Timestamp timestamp) {
        return timestamp != null ? timestamp.toLocalDateTime() : null;
    }
    
    @Named("toLocalTime")
    default LocalTime toLocalTime(Time time) {
        return time != null ? time.toLocalTime() : null;
    }
    
    @Named("toTime")
    default Time toTime(LocalTime localTime) {
        return localTime != null ? Time.valueOf(localTime) : null;
    }
    
    @Named("getFullName")
    default String getFullName(String firstName, String lastName) {
        if (firstName == null && lastName == null) {
            return null;
        }
        if (firstName == null) {
            return lastName;
        }
        if (lastName == null) {
            return firstName;
        }
        return firstName + " " + lastName;
    }
    
    @Named("getDefaultProfilePicture")
    default String getDefaultProfilePicture() {
        return null;
    }
}