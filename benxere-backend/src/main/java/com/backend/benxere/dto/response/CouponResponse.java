package com.backend.benxere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CouponResponse {
    private Integer couponId;
    private String code;
    private String description;
    private Integer discountPercentage;
    private BigDecimal discountFixed;
    private BigDecimal minBookingAmount;
    private BigDecimal maxDiscountAmount;
    private LocalDateTime validFrom;
    private LocalDateTime validTo;
    private Boolean active;
    private Integer usageLimit;
    private Integer usageCount;
    private Integer creatorId;
}
