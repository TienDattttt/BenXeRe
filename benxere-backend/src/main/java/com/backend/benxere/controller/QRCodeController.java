package com.backend.benxere.controller;

import com.backend.benxere.dto.request.ApiResponse;
import com.backend.benxere.dto.request.QRCodeScanRequest;
import com.backend.benxere.dto.response.SeatResponse;
import com.backend.benxere.service.SeatService;
import com.backend.benxere.service.qrcode.QRCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qrcode")
@RequiredArgsConstructor
public class QRCodeController {

    private final SeatService seatService;
    private final QRCodeService qrCodeService;

    @PostMapping("/scan")
    public ApiResponse<SeatResponse> scanQRCode(@RequestBody QRCodeScanRequest request) {
        return ApiResponse.<SeatResponse>builder()
                .result(seatService.processSeatQRCodeScan(request.getQrCodeContent()))
                .build();
    }


    @GetMapping("/seat/{seatId}")
    public ApiResponse<String> getSeatQRCode(@PathVariable int seatId) {
        SeatResponse seat = seatService.getSeatById(seatId);
        return ApiResponse.<String>builder()
                .result(seat.getQrCodeData())
                .build();
    }
}