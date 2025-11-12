package com.backend.benxere.configuration;

import com.backend.benxere.entity.enums.PaymentStatus;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;

public class PaymentStatusDeserializer extends JsonDeserializer<PaymentStatus> {
    @Override
    public PaymentStatus deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getText();
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        try {
            return PaymentStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("No enum constant " + PaymentStatus.class.getName() + "." + value + 
                ". Valid values are: PENDING, COMPLETED, FAILED, REFUNDED");
        }
    }
}