package com.backend.benxere.controller;

import com.backend.benxere.dto.request.ApiResponse;
import com.backend.benxere.dto.request.BookingCreationRequest;
import com.backend.benxere.dto.request.PaymentRequest;
import com.backend.benxere.dto.response.BookingResponse;
import com.backend.benxere.dto.response.BookingWithPaymentResponse;
import com.backend.benxere.dto.response.PaymentResponse;
import com.backend.benxere.entity.enums.EntityType;
import com.backend.benxere.entity.enums.PaymentMethod;
import com.backend.benxere.service.BookingService;
import com.backend.benxere.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingController {
    @Autowired
    BookingService bookingService;
    @Autowired
    PaymentService paymentService;

    @PostMapping
    public ApiResponse<BookingWithPaymentResponse> createBooking(@RequestBody @Valid BookingCreationRequest request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        
        BookingResponse bookingResponse = bookingService.createBooking(request);
        
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setRelatedEntityId(bookingResponse.getBookingId());
        paymentRequest.setEntityType(EntityType.BOOKING);
        
        paymentRequest.setAmount(bookingResponse.getTotalPrice());
        paymentRequest.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod().name()));
        paymentRequest.setReturnUrl(request.getReturnUrl());
        
        if (bookingResponse.getCouponId() != null) {
            paymentRequest.setCouponCode(bookingResponse.getCouponCode());
            paymentRequest.setCouponId(bookingResponse.getCouponId());
            paymentRequest.setOriginalAmount(bookingResponse.getOriginalPrice());
            paymentRequest.setDiscountAmount(bookingResponse.getDiscountAmount());
        }
        
        PaymentResponse paymentResponse = paymentService.createPayment(paymentRequest, userEmail);
        
        BookingWithPaymentResponse response = new BookingWithPaymentResponse();
        response.setBooking(bookingResponse);
        response.setPayment(paymentResponse);
        
        return ApiResponse.<BookingWithPaymentResponse>builder().result(response).build();
    }

    @GetMapping
    public ApiResponse<List<BookingResponse>> getAllBookings() {
        return ApiResponse.<List<BookingResponse>>builder()
                .result(bookingService.getAllBookings())
                .build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable int id) {
        BookingResponse bookingResponse = bookingService.getBookingById(id);
        return ResponseEntity.ok(bookingResponse);
    }

    @PutMapping("/{id}")
    public ApiResponse<BookingResponse> updateBooking(@PathVariable int id, @RequestBody @Valid BookingCreationRequest request) {
        BookingResponse response = bookingService.updateBooking(id, request);
        return ApiResponse.<BookingResponse>builder().result(response).build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteBooking(@PathVariable int id) {
        bookingService.deleteBooking(id);
        return ApiResponse.<String>builder().result("Booking has been deleted").build();
    }

    @GetMapping("/schedule/{scheduleId}")
    public ApiResponse<List<BookingResponse>> getBookingsByScheduleId(@PathVariable int scheduleId) {
        return ApiResponse.<List<BookingResponse>>builder()
                .result(bookingService.getBookingsByScheduleId(scheduleId))
                .build();
    }

    @GetMapping("/me")
    public ApiResponse<List<BookingWithPaymentResponse>> getBookingsByCurrentUser() {
        return ApiResponse.<List<BookingWithPaymentResponse>>builder()
                .result(bookingService.getBookingsWithPaymentByCurrentUser())
                .build();
    }
}