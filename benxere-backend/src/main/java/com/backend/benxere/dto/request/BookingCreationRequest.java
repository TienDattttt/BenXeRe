package com.backend.benxere.dto.request;

import com.backend.benxere.entity.Booking;
import com.backend.benxere.entity.enums.PaymentMethod;
import com.backend.benxere.configuration.PaymentMethodDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class BookingCreationRequest {
    private int scheduleId;
    private List<Integer> seatIds;
    private int pickUpLocationId;
    private int dropOffLocationId;
    private int userId;
    private int couponId;
    private String couponCode;
    
    private Booking.BookingStatus status;
    
    @NotNull(message = "Payment method is required")
    @JsonDeserialize(using = PaymentMethodDeserializer.class)
    private PaymentMethod paymentMethod;
    
    private String returnUrl;
}