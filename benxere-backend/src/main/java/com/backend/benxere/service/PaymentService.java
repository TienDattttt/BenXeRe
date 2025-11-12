package com.backend.benxere.service;

import com.backend.benxere.dto.request.PaymentRequest;
import com.backend.benxere.dto.response.PaymentResponse;

public interface PaymentService {
    PaymentResponse createPayment(PaymentRequest request, String userEmail);
    PaymentResponse getPaymentStatus(int paymentId);
    PaymentResponse handlePaymentCallback(String paymentMethod, String requestData);
    void deleteOldPendingPayments();
    PaymentResponse getPaymentByRelatedEntityId(Integer relatedEntityId);
}