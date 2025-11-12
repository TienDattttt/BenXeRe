package com.backend.benxere.exception;

import com.backend.benxere.dto.request.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class CustomExceptionHandler {

    @ExceptionHandler(AuthenticationServiceException.class)
    public ResponseEntity<ApiResponse<String>> handleAuthenticationServiceException(AuthenticationServiceException ex) {
        ApiResponse<String> response = ApiResponse.<String>builder()
                .code(401)
                .message("Token invalid")
                .result(null)
                .build();
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }
}