package com.backend.benxere.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.backend.benxere.dto.response.ScheduleResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final ScheduleService scheduleService;
    
    public List<ScheduleResponse> getSchedulesByDriver() {
        return scheduleService.getScheduleByCurrentDriver();
    }
}