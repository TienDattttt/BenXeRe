package com.backend.benxere.controller;

import com.backend.benxere.dto.request.SeatUpdateRequest;
import com.backend.benxere.dto.response.ScheduleResponse;
import com.backend.benxere.dto.response.SeatResponse;
import com.backend.benxere.mapper.ScheduleMapper;
import com.backend.benxere.service.ScheduleService;
import com.backend.benxere.service.ScheduleStatusService;
import com.backend.benxere.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/driver")
@RequiredArgsConstructor
public class DriverController {
    private final ScheduleService scheduleService;
    private final SeatService seatService;
    private final ScheduleStatusService scheduleStatusService;
    private final ScheduleMapper scheduleMapper;

    @GetMapping("/schedules")
    public List<ScheduleResponse> getSchedulesByCurrentUser() {
        return scheduleService.getScheduleByCurrentDriver();
    }
    
    @GetMapping("/schedules/{scheduleId}/seats")
    public ResponseEntity<List<SeatResponse>> getSeatsBySchedule(@PathVariable int scheduleId) {
        return ResponseEntity.ok(seatService.getSeatsByScheduleId(scheduleId));
    }
    
    @GetMapping("/seats/{seatId}")
    public ResponseEntity<SeatResponse> getSeatById(@PathVariable int seatId) {
        return ResponseEntity.ok(seatService.getSeatById(seatId));
    }
    
    @PutMapping("/seats/{seatId}/check-in")
    public ResponseEntity<SeatResponse> checkInPassenger(@PathVariable int seatId) {
        return ResponseEntity.ok(seatService.checkInPassenger(seatId));
    }
    
    @PutMapping("/seats/{seatId}/check-out")
    public ResponseEntity<SeatResponse> checkOutPassenger(@PathVariable int seatId) {
        return ResponseEntity.ok(seatService.checkOutPassenger(seatId));
    }
    
    @PutMapping("/seats/{seatId}")
    public ResponseEntity<SeatResponse> updateSeatStatus(
            @PathVariable int seatId,
            @RequestBody SeatUpdateRequest request) {
        return ResponseEntity.ok(seatService.updateSeatByDriver(seatId, request));
    }
    
    @PutMapping("/seats/{seatId}/status")
    public ResponseEntity<SeatResponse> updatePassengerStatus(
            @PathVariable int seatId,
            @RequestParam String status) {
        return ResponseEntity.ok(seatService.updatePassengerStatus(seatId, status));
    }
    
    @PutMapping("/seats/{seatId}/notes")
    public ResponseEntity<SeatResponse> addDriverNotes(
            @PathVariable int seatId,
            @RequestParam String notes) {
        return ResponseEntity.ok(seatService.addDriverNotes(seatId, notes));
    }
    
    @PutMapping("/seats/{seatId}/baggage")
    public ResponseEntity<SeatResponse> updateBaggageCount(
            @PathVariable int seatId,
            @RequestParam int count) {
        return ResponseEntity.ok(seatService.updateBaggageCount(seatId, count));
    }
}