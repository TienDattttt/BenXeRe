package com.backend.benxere.configuration;

import com.backend.benxere.entity.enums.PaymentMethod;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;

public class PaymentMethodDeserializer extends JsonDeserializer<PaymentMethod> {
    @Override
    public PaymentMethod deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getText();
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        try {
            return PaymentMethod.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("No enum constant " + PaymentMethod.class.getName() + "." + value + 
                ". Valid values are: CASH, ZALOPAY, MOMO, VNPAY");
        }
    }
} 