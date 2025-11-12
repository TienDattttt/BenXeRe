package com.backend.benxere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Integer userId;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String role;
    private Integer employerId;
    private String employerEmail;
    private LocalDateTime createdAt;
    private LocalTime workStartTime;
    private LocalTime workEndTime;
    private String status;
    private String fullName;
    private String profilePictureUrl;
}