package com.backend.benxere.dto.request;

import lombok.Data;
import java.time.LocalTime;

@Data
public class EmployeeCreationRequest {
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String roleId;
    private LocalTime workStartTime;
    private LocalTime workEndTime;
}
