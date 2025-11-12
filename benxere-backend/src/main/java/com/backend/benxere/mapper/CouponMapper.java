package com.backend.benxere.mapper;

import com.backend.benxere.dto.request.CouponCreationRequest;
import com.backend.benxere.dto.response.CouponResponse;
import com.backend.benxere.entity.Coupon;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Mapper(componentModel = "spring", imports = {BigDecimal.class, LocalDateTime.class})
public interface CouponMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", source = "code")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "discountPercentage", source = "discountPercentage", defaultValue = "0")
    @Mapping(target = "discountFixed", source = "discountFixed")
    @Mapping(target = "minBookingAmount", source = "minBookingAmount", defaultExpression = "java(BigDecimal.ZERO)")
    @Mapping(target = "maxDiscountAmount", source = "maxDiscountAmount")
    @Mapping(target = "validFrom", source = "validFrom", defaultExpression = "java(LocalDateTime.now())")
    @Mapping(target = "validTo", source = "validTo", defaultExpression = "java(LocalDateTime.now().plusMonths(1))")
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "usageLimit", constant = "0")
    @Mapping(target = "usageCount", constant = "0")
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Coupon toCoupon(CouponCreationRequest request);

    @Mapping(target = "couponId", source = "id")
    @Mapping(target = "code", source = "code")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "discountPercentage", source = "discountPercentage")
    @Mapping(target = "discountFixed", source = "discountFixed")
    @Mapping(target = "minBookingAmount", source = "minBookingAmount")
    @Mapping(target = "maxDiscountAmount", source = "maxDiscountAmount")
    @Mapping(target = "validFrom", source = "validFrom")
    @Mapping(target = "validTo", source = "validTo")
    @Mapping(target = "active", source = "isActive")
    @Mapping(target = "usageLimit", source = "usageLimit")
    @Mapping(target = "usageCount", source = "usageCount")
    @Mapping(target = "creatorId", source = "createdBy.userId")
    CouponResponse toCouponResponse(Coupon coupon);
}