package com.backend.benxere.dto.response;

import com.backend.benxere.entity.enums.PaymentMethod;
import com.backend.benxere.entity.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResponse {
    private Integer paymentId;
    private Long amount;
    private PaymentStatus status;
    private PaymentMethod paymentMethod;
    private String paymentUrl;
    private String message;
    private String transId;
}