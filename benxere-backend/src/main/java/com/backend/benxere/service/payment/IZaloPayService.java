package com.backend.benxere.service.payment;

import com.backend.benxere.dto.response.ZaloPayCallbackResponse;
import com.backend.benxere.entity.Payment;
import java.util.Map;

public interface IZaloPayService {
  
    Map<String, String> createPayment(Payment payment);

    ZaloPayCallbackResponse processCallback(String requestData, String receivedMac);
}