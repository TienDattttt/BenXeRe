package com.backend.benxere.controller;

import java.text.ParseException;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.benxere.dto.request.ApiResponse;
import com.backend.benxere.dto.request.AuthenticationRequest;
import com.backend.benxere.dto.request.IntrospectRequest;
import com.backend.benxere.dto.request.LogoutRequest;
import com.backend.benxere.dto.request.RefreshRequest;
import com.backend.benxere.dto.request.SendOtpRequest;
import com.backend.benxere.dto.request.SignUpRequest;
import com.backend.benxere.dto.request.VerifyOtpOnlyRequest;
import com.backend.benxere.dto.request.VerifyOtpRequest;
import com.backend.benxere.dto.response.AuthenticationResponse;
import com.backend.benxere.dto.response.IntrospectResponse;
import com.backend.benxere.service.AuthenticationService;
import com.backend.benxere.service.UserService;
import com.nimbusds.jose.JOSEException;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final UserService userService;
    private final AuthenticationService authenticationService;   
    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<?> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        userService.initiatePasswordReset(request.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpOnlyRequest request) {
        boolean isValid = userService.verifyOtp(request.getEmail(), request.getOtp());
        if (isValid) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().body("Invalid OTP");
        }
    }

    @PostMapping("/forgot-password/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody VerifyOtpRequest request) {
        userService.resetPassword(request.getEmail(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/token")
    public ApiResponse<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        var result = authenticationService.authenticate(request);
        return ApiResponse.<AuthenticationResponse>builder().result(result).build();
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request)
            throws ParseException, JOSEException {
        var result = authenticationService.introspect(request);
        return ApiResponse.<IntrospectResponse>builder().result(result).build();
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthenticationResponse> refresh(@RequestBody RefreshRequest request)
            throws ParseException, JOSEException {
        var result = authenticationService.refreshToken(request);
        return ApiResponse.<AuthenticationResponse>builder().result(result).build();
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        authenticationService.logout(request);
        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/sign-up")
    public ApiResponse<AuthenticationResponse> signUp(@RequestBody SignUpRequest request) {
        var result = authenticationService.signUp(request);
        return ApiResponse.<AuthenticationResponse>builder().result(result).build();
    }
}