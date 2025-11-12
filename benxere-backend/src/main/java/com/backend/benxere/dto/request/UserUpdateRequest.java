package com.backend.benxere.dto.request;

import lombok.Data;
import java.time.LocalTime;

@Data
public class UserUpdateRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String password;
    private String roleId;
    private LocalTime workStartTime;
    private LocalTime workEndTime;
}