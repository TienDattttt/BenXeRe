package com.backend.benxere.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRequestDto {
    private int scheduleId;
    private String location;
    private double latitude;
    private double longitude;
    private String notes;
}