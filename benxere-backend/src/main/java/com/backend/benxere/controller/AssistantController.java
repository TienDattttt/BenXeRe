package com.backend.benxere.controller;

import com.backend.benxere.dto.request.ApiResponse;
import com.backend.benxere.dto.request.QrScanRequest;
import com.backend.benxere.dto.request.SeatUpdateRequest;
import com.backend.benxere.dto.response.ScheduleResponse;
import com.backend.benxere.dto.response.SeatResponse;
import com.backend.benxere.service.ScheduleService;
import com.backend.benxere.service.SeatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assistant")
@RequiredArgsConstructor
@Slf4j
public class AssistantController {

    private final ScheduleService scheduleService;
    private final SeatService seatService;

    @GetMapping("/schedules")
    public ApiResponse<List<ScheduleResponse>> getSchedulesForAssistant() {
        return ApiResponse.<List<ScheduleResponse>>builder()
                .result(scheduleService.getScheduleByCurrentAssistant())
                .build();
    }

    @GetMapping("/schedules/{scheduleId}/seats")
    public ApiResponse<List<SeatResponse>> getSeatsByScheduleId(@PathVariable int scheduleId) {
        return ApiResponse.<List<SeatResponse>>builder()
                .result(seatService.getSeatsByScheduleId(scheduleId))
                .build();
    }

    @PutMapping("/seats/{seatId}/check-in")
    public ApiResponse<SeatResponse> checkInPassenger(@PathVariable int seatId) {
        return ApiResponse.<SeatResponse>builder()
                .result(seatService.checkInPassenger(seatId))
                .build();
    }

    @PutMapping("/seats/{seatId}/check-out")
    public ApiResponse<SeatResponse> checkOutPassenger(@PathVariable int seatId) {
        return ApiResponse.<SeatResponse>builder()
                .result(seatService.checkOutPassenger(seatId))
                .build();
    }

    @PutMapping("/seats/{seatId}/status")
    public ApiResponse<SeatResponse> updatePassengerStatus(
            @PathVariable int seatId,
            @RequestParam String status) {
        return ApiResponse.<SeatResponse>builder()
                .result(seatService.updatePassengerStatus(seatId, status))
                .build();
    }

    @PutMapping("/seats/{seatId}/baggage")
    public ApiResponse<SeatResponse> updateBaggageCount(
            @PathVariable int seatId,
            @RequestParam int count) {
        return ApiResponse.<SeatResponse>builder()
                .result(seatService.updateBaggageCount(seatId, count))
                .build();
    }

    @PutMapping("/seats/{seatId}/notes")
    public ApiResponse<SeatResponse> addDriverNotes(
            @PathVariable int seatId,
            @RequestParam String notes) {
        return ApiResponse.<SeatResponse>builder()
                .result(seatService.addDriverNotes(seatId, notes))
                .build();
    }

    @PutMapping("/seats/{seatId}")
    public ApiResponse<SeatResponse> updateSeat(
            @PathVariable int seatId,
            @RequestBody SeatUpdateRequest request) {
        return ApiResponse.<SeatResponse>builder()
                .result(seatService.updateSeatByDriver(seatId, request))
                .build();
    }

    @PostMapping("/scan-qr")
    public ApiResponse<SeatResponse> scanQRCode(@RequestBody QrScanRequest request) {
        log.info("Received QR scan request with content length: {}", 
                request.getQrContent() != null ? request.getQrContent().length() : 0);
        return ApiResponse.<SeatResponse>builder()
                .result(seatService.processSeatQRCodeScan(request.getQrContent()))
                .build();
    }
}