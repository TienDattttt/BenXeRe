package com.backend.benxere.dto.request;

import com.backend.benxere.entity.enums.PaymentMethod;
import com.backend.benxere.entity.enums.EntityType;
import lombok.Data;

@Data
public class PaymentRequest {
    private double amount;
    private double originalAmount;
    private double discountAmount;
    private PaymentMethod paymentMethod;
    private EntityType entityType;
    private Integer relatedEntityId;
    private String returnUrl;
    private Integer couponId;
    private String couponCode;

    public Long getAmountAsLong() {
        return (long)(amount);
    }
    
    public Long getOriginalAmountAsLong() {
        return originalAmount > 0 ? (long)(originalAmount) : getAmountAsLong();
    }
    
    public Long getDiscountAmountAsLong() {
        return (long)(discountAmount);
    }
}