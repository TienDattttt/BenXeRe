package com.backend.benxere.controller;

import com.backend.benxere.dto.request.ScheduleStatusRequest;
import com.backend.benxere.entity.Schedule;
import com.backend.benxere.service.ScheduleStatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ScheduleStatusController {
    private final ScheduleStatusService scheduleStatusService;


    @PutMapping("/driver/schedules/{scheduleId}/status")
    public ResponseEntity<Object> updateScheduleStatus(
            @PathVariable int scheduleId,
            @RequestBody ScheduleStatusRequest request) {
        log.info("API Call: PUT /driver/schedules/{}/status", scheduleId);
        
        Schedule updatedSchedule = scheduleStatusService.updateScheduleStatus(scheduleId, request);
        
        Map<String, Object> response = new HashMap<>();
        response.put("scheduleId", updatedSchedule.getScheduleId());
        response.put("status", updatedSchedule.getStatus());
        response.put("actualStartTime", updatedSchedule.getActualStartTime());
        response.put("actualEndTime", updatedSchedule.getActualEndTime());
        
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/assistant/schedules/{scheduleId}/status")
    public ResponseEntity<Object> updateScheduleStatusAsAssistant(
            @PathVariable int scheduleId,
            @RequestBody ScheduleStatusRequest request) {
        log.info("API Call: PUT /assistant/schedules/{}/status", scheduleId);
        
        Schedule updatedSchedule = scheduleStatusService.updateScheduleStatus(scheduleId, request);
        
        Map<String, Object> response = new HashMap<>();
        response.put("scheduleId", updatedSchedule.getScheduleId());
        response.put("status", updatedSchedule.getStatus());
        response.put("actualStartTime", updatedSchedule.getActualStartTime());
        response.put("actualEndTime", updatedSchedule.getActualEndTime());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/schedules/{scheduleId}/status")
    public ResponseEntity<Object> getScheduleStatus(@PathVariable int scheduleId) {
        log.info("API Call: GET /schedules/{}/status", scheduleId);
        
        Schedule schedule = scheduleStatusService.getScheduleById(scheduleId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("scheduleId", schedule.getScheduleId());
        response.put("status", schedule.getStatus());
        response.put("actualStartTime", schedule.getActualStartTime());
        response.put("actualEndTime", schedule.getActualEndTime());
        
        return ResponseEntity.ok(response);
    }
}