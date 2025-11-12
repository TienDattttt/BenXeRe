package com.backend.benxere.controller;

import com.backend.benxere.dto.request.ScheduleIssueRequest;
import com.backend.benxere.dto.response.ScheduleIssueResponse;
import com.backend.benxere.service.ScheduleIssueService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ScheduleIssueController {
    private final ScheduleIssueService scheduleIssueService;

    @PostMapping("/driver/schedules/{scheduleId}/issues")
    public ResponseEntity<Object> reportIssue(
            @PathVariable int scheduleId,
            @RequestBody ScheduleIssueRequest request) {
        log.info("API Call: POST /driver/schedules/{}/issues", scheduleId);
        ScheduleIssueResponse response = scheduleIssueService.reportIssue(scheduleId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PostMapping("/assistant/schedules/{scheduleId}/issues")
    public ResponseEntity<Object> reportIssueAsAssistant(
            @PathVariable int scheduleId,
            @RequestBody ScheduleIssueRequest request) {
        log.info("API Call: POST /assistant/schedules/{}/issues", scheduleId);
        ScheduleIssueResponse response = scheduleIssueService.reportIssue(scheduleId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/driver/schedules/{scheduleId}/issues")
    public ResponseEntity<Object> getIssuesBySchedule(@PathVariable int scheduleId) {
        log.info("API Call: GET /driver/schedules/{}/issues", scheduleId);
        List<ScheduleIssueResponse> issues = scheduleIssueService.getIssuesBySchedule(scheduleId);
        return ResponseEntity.ok(issues);
    }
    
    @GetMapping("/assistant/schedules/{scheduleId}/issues")
    public ResponseEntity<Object> getIssuesByScheduleAsAssistant(@PathVariable int scheduleId) {
        log.info("API Call: GET /assistant/schedules/{}/issues", scheduleId);
        List<ScheduleIssueResponse> issues = scheduleIssueService.getIssuesBySchedule(scheduleId);
        return ResponseEntity.ok(issues);
    }
    
    @GetMapping("/schedules/{scheduleId}/issues")
    public ResponseEntity<Object> getPublicIssuesBySchedule(@PathVariable int scheduleId) {
        log.info("API Call: GET /schedules/{}/issues", scheduleId);
        List<ScheduleIssueResponse> issues = scheduleIssueService.getPublicIssuesBySchedule(scheduleId);
        return ResponseEntity.ok(issues);
    }

    @PutMapping("/driver/schedules/issues/{issueId}/status")
    public ResponseEntity<Object> updateIssueStatus(
            @PathVariable int issueId,
            @RequestBody Map<String, String> requestBody) {
        log.info("API Call: PUT /driver/schedules/issues/{}/status", issueId);
        String status = requestBody.get("status");
        if (status == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Status is required");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        ScheduleIssueResponse response = scheduleIssueService.updateIssueStatus(issueId, status);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/assistant/schedules/issues/{issueId}/status")
    public ResponseEntity<Object> updateIssueStatusAsAssistant(
            @PathVariable int issueId,
            @RequestBody Map<String, String> requestBody) {
        log.info("API Call: PUT /assistant/schedules/issues/{}/status", issueId);
        String status = requestBody.get("status");
        if (status == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Status is required");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        ScheduleIssueResponse response = scheduleIssueService.updateIssueStatus(issueId, status);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/driver/schedules/issues/{issueId}/resolution")
    public ResponseEntity<Object> addResolutionNotes(
            @PathVariable int issueId,
            @RequestBody Map<String, String> requestBody) {
        log.info("API Call: PUT /driver/schedules/issues/{}/resolution", issueId);
        String notes = requestBody.get("notes");
        if (notes == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Resolution notes are required");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        ScheduleIssueResponse response = scheduleIssueService.addResolutionNotes(issueId, notes);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/assistant/schedules/issues/{issueId}/resolution")
    public ResponseEntity<Object> addResolutionNotesAsAssistant(
            @PathVariable int issueId,
            @RequestBody Map<String, String> requestBody) {
        log.info("API Call: PUT /assistant/schedules/issues/{}/resolution", issueId);
        String notes = requestBody.get("notes");
        if (notes == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Resolution notes are required");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        ScheduleIssueResponse response = scheduleIssueService.addResolutionNotes(issueId, notes);
        return ResponseEntity.ok(response);
    }
}