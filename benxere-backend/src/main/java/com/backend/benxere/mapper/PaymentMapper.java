package com.backend.benxere.mapper;

import com.backend.benxere.dto.response.PaymentResponse;
import com.backend.benxere.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {
    public PaymentResponse toResponse(Payment payment) {
        if (payment == null) {
            return null;
        }

        return PaymentResponse.builder()
            .paymentId(payment.getPaymentId())
            .amount(payment.getAmount())
            .paymentMethod(payment.getPaymentMethod())
            .status(payment.getPaymentStatus())
            .transId(payment.getTransId())
            .message("Payment details retrieved successfully")
            .build();
    }
}