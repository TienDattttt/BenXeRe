package com.backend.benxere.exception;

import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public class AppException extends RuntimeException {
    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;

    public AppException(ErrorCode errorCode) {
        this.code = errorCode.getCode();
        this.message = errorCode.getMessage();
        this.statusCode = errorCode.getStatusCode();
    }

    public AppException(ErrorCode errorCode, String message) {
        this.code = errorCode.getCode();
        this.message = message;
        this.statusCode = errorCode.getStatusCode();
    }

    public AppException(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
