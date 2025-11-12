package com.backend.benxere.dto.response;

import lombok.Data;

@Data
public class BookingWithPaymentResponse {
    private BookingResponse booking;
    private PaymentResponse payment;
}