package com.backend.benxere.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Uncategorized error", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "User existed", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),
    IMAGE_NOT_FOUND(1009, "Image not found", HttpStatus.NOT_FOUND),
    BUS_NOT_FOUND(1010, "Bus not found", HttpStatus.NOT_FOUND),
    COUPON_NOT_FOUND(1011, "Coupon not found", HttpStatus.NOT_FOUND),
    BANNER_NOT_FOUND(1012, "Banner not found", HttpStatus.NOT_FOUND),
    FLASH_SALE_NOT_FOUND(1013, "Flash sale not found", HttpStatus.NOT_FOUND),
    BOOKING_NOT_FOUND(1014, "Booking not found", HttpStatus.NOT_FOUND),
    SCHEDULE_NOT_FOUND(1015, "Schedule not found", HttpStatus.NOT_FOUND),
    ROUTE_NOT_FOUND(1016, "Route not found", HttpStatus.NOT_FOUND),
    LOCATION_NOT_FOUND(1017, "Location not found", HttpStatus.NOT_FOUND),
    ROLE_NOT_FOUND(1018, "Role not found", HttpStatus.NOT_FOUND),
    MESSAGE_NOT_FOUND(1019, "Message not found", HttpStatus.NOT_FOUND),
    PAYMENT_NOT_FOUND(1020, "Payment not found", HttpStatus.NOT_FOUND),
    INVALID_PAYMENT_METHOD(1021, "Invalid payment method", HttpStatus.BAD_REQUEST),
    PAYMENT_CREATION_FAILED(1022, "Failed to create payment", HttpStatus.INTERNAL_SERVER_ERROR),
    PAYMENT_VERIFICATION_FAILED(1023, "Failed to verify payment", HttpStatus.BAD_REQUEST),
    INVALID_CALLBACK_DATA(1024, "Invalid callback data received", HttpStatus.BAD_REQUEST),
    INVALID_TRANSACTION_ID(1025, "Invalid transaction ID format", HttpStatus.BAD_REQUEST),
    INVALID_TRANSACTION_ID_LENGTH(1026, "Invalid transaction ID length", HttpStatus.BAD_REQUEST),
    INVALID_OTP(1027, "Invalid OTP code", HttpStatus.BAD_REQUEST),
    OTP_EXPIRED(1028, "OTP code has expired", HttpStatus.BAD_REQUEST),
    RESOURCE_NOT_FOUND(1029, "Resource not found", HttpStatus.NOT_FOUND),
    BAD_REQUEST(1030, "Bad request", HttpStatus.BAD_REQUEST),
    ACCESS_DENIED(1031, "Access denied", HttpStatus.FORBIDDEN),
    
    // Chat related errors
    CHAT_ROOM_NOT_FOUND(1032, "Chat room not found", HttpStatus.NOT_FOUND),
    INVALID_REQUEST(1033, "Invalid request", HttpStatus.BAD_REQUEST),
    VOICE_CALL_NOT_FOUND(1034, "Voice call not found", HttpStatus.NOT_FOUND),
    CHAT_PERMISSION_DENIED(1035, "You don't have permission to access this chat", HttpStatus.FORBIDDEN);


    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}
