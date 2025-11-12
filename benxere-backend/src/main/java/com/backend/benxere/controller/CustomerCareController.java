package com.backend.benxere.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.backend.benxere.dto.request.ApiResponse;
import com.backend.benxere.dto.request.BookingCreationRequest;
import com.backend.benxere.dto.request.SeatChangeRequest;
import com.backend.benxere.dto.response.BookingResponse;
import com.backend.benxere.dto.response.ScheduleResponse;
import com.backend.benxere.dto.response.SeatResponse;
import com.backend.benxere.service.CustomerCareService;

@RestController
@RequestMapping("/api/customer-care")
public class CustomerCareController {

    private final CustomerCareService customerCareService;

    @Autowired
    public CustomerCareController(CustomerCareService customerCareService) {
        this.customerCareService = customerCareService;
    }

    @GetMapping("/schedules")
    public ApiResponse<List<ScheduleResponse>> getBusOwnerSchedules() {
        List<ScheduleResponse> schedules = customerCareService.getBusOwnerSchedules();
        return ApiResponse.<List<ScheduleResponse>>builder()
            .result(schedules)
            .code(1000)
            .message("Successfully retrieved bus owner schedules")
            .build();
    }

    @PostMapping("/bookings")
    public ApiResponse<BookingResponse> createBookingForCustomer(@RequestBody BookingCreationRequest request) {
        BookingResponse booking = customerCareService.createBookingForCustomer(request);
        return ApiResponse.<BookingResponse>builder()
            .result(booking)
            .code(1000)
            .message("Successfully created booking for customer")
            .build();
    }

    @PutMapping("/seats/{seatId}/status")
    public ApiResponse<SeatResponse> updateSeatStatus(
            @PathVariable int seatId,
            @RequestParam boolean isBooked) {
        SeatResponse seat = customerCareService.updateSeatStatus(seatId, isBooked);
        return ApiResponse.<SeatResponse>builder()
            .result(seat)
            .code(1000)
            .message("Successfully updated seat status")
            .build();
    }

    @PutMapping("/seats/change")
    public ApiResponse<BookingResponse> changeCustomerSeats(@RequestBody SeatChangeRequest request) {
        BookingResponse booking = customerCareService.changeCustomerSeats(request);
        return ApiResponse.<BookingResponse>builder()
            .result(booking)
            .code(1000)
            .message("Successfully changed customer seats")
            .build();
    }
}
 