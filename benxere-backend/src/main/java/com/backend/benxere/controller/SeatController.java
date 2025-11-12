package com.backend.benxere.controller;

import com.backend.benxere.dto.request.SeatRequest;
import com.backend.benxere.dto.response.SeatResponse;
import com.backend.benxere.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
public class SeatController {
    private final SeatService seatService;

    @PostMapping
    public ResponseEntity<SeatResponse> createSeat(@RequestBody SeatRequest seatRequest) {
        SeatResponse createdSeat = seatService.createSeat(seatRequest);
        return ResponseEntity.ok(createdSeat);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SeatResponse> getSeatById(@PathVariable int id) {
        SeatResponse seat = seatService.getSeatById(id);
        return ResponseEntity.ok(seat);
    }

    @GetMapping
    public ResponseEntity<List<SeatResponse>> getAllSeats() {
        List<SeatResponse> seats = seatService.getAllSeats();
        return ResponseEntity.ok(seats);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SeatResponse> updateSeat(@PathVariable int id, @RequestBody SeatRequest seatRequest) {
        SeatResponse updatedSeat = seatService.updateSeat(id, seatRequest);
        return ResponseEntity.ok(updatedSeat);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSeat(@PathVariable int id) {
        seatService.deleteSeat(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/schedule/{scheduleId}")
    public ResponseEntity<List<SeatResponse>> getSeatsByScheduleId(@PathVariable int scheduleId) {
        List<SeatResponse> seats = seatService.getSeatsByScheduleId(scheduleId);
        return ResponseEntity.ok(seats);
    }
}