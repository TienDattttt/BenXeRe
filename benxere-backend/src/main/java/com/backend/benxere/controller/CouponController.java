package com.backend.benxere.controller;

import com.backend.benxere.dto.request.ApiResponse;
import com.backend.benxere.dto.request.CouponCreationRequest;
import com.backend.benxere.dto.response.CouponResponse;
import com.backend.benxere.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CouponController {
    CouponService couponService;

    @PostMapping
    public ApiResponse<CouponResponse> createCoupon(@RequestBody @Valid CouponCreationRequest request) {
        CouponResponse response = couponService.createCoupon(request);
        return ApiResponse.<CouponResponse>builder().result(response).build();
    }

    @GetMapping
    public ApiResponse<List<CouponResponse>> getAllCoupons() {
        return ApiResponse.<List<CouponResponse>>builder()
                .result(couponService.getAllCoupons())
                .build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CouponResponse> getCouponById(@PathVariable int id) {
        CouponResponse couponResponse = couponService.getCouponById(id);
        return ResponseEntity.ok(couponResponse);
    }

    @PutMapping("/{id}")
    public ApiResponse<CouponResponse> updateCoupon(@PathVariable int id, @RequestBody @Valid CouponCreationRequest request) {
        CouponResponse response = couponService.updateCoupon(id, request);
        return ApiResponse.<CouponResponse>builder().result(response).build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteCoupon(@PathVariable int id) {
        couponService.deleteCoupon(id);
        return ApiResponse.<String>builder().result("Coupon has been deleted").build();
    }
    @GetMapping("/code/{code}")
    public ResponseEntity<CouponResponse> getCouponByCode(@PathVariable String code) {
        CouponResponse couponResponse = couponService.getCouponByCode(code);
        return ResponseEntity.ok(couponResponse);
    }
}