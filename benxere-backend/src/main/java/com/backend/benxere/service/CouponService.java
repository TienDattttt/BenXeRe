package com.backend.benxere.service;

import com.backend.benxere.dto.request.CouponCreationRequest;
import com.backend.benxere.dto.response.CouponResponse;
import com.backend.benxere.entity.Coupon;
import com.backend.benxere.entity.User;
import com.backend.benxere.exception.AppException;
import com.backend.benxere.exception.ErrorCode;
import com.backend.benxere.mapper.CouponMapper;
import com.backend.benxere.repository.CouponRepository;
import com.backend.benxere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CouponService {

    private final CouponRepository couponRepository;
    private final UserRepository userRepository;
    private final CouponMapper couponMapper;

    @Autowired
    public CouponService(CouponRepository couponRepository,
                         UserRepository userRepository,
                         @Qualifier("couponMapperImpl") CouponMapper couponMapper) {
        this.couponRepository = couponRepository;
        this.userRepository = userRepository;
        this.couponMapper = couponMapper;
    }

    public CouponResponse createCoupon(CouponCreationRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User creator = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Coupon coupon = couponMapper.toCoupon(request);
        coupon.setCreatedBy(creator);
        coupon.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        coupon = couponRepository.save(coupon);
        return couponMapper.toCouponResponse(coupon);
    }

    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(couponMapper::toCouponResponse)
                .collect(Collectors.toList());
    }

    public CouponResponse getCouponById(int id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));
        return couponMapper.toCouponResponse(coupon);
    }

    public void deleteCoupon(int id) {
        couponRepository.deleteById(id);
    }

    public CouponResponse updateCoupon(int id, CouponCreationRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));

        coupon.setCode(request.getCode());
        coupon.setDescription(request.getDescription());
        coupon.setDiscountPercentage(request.getDiscountPercentage() != null ? request.getDiscountPercentage() : 0);
        coupon.setDiscountFixed(request.getDiscountFixed());
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setMinBookingAmount(request.getMinBookingAmount() != null ? request.getMinBookingAmount() : BigDecimal.ZERO);
        coupon.setValidFrom(request.getValidFrom() != null ? request.getValidFrom() : LocalDateTime.now());
        coupon.setValidTo(request.getValidTo() != null ? request.getValidTo() : LocalDateTime.now().plusMonths(1));
        
        coupon = couponRepository.save(coupon);
        return couponMapper.toCouponResponse(coupon);
    }

    public CouponResponse getCouponByCode(String code) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));
        return couponMapper.toCouponResponse(coupon);
    }

    public BigDecimal validateCouponAndCalculateDiscount(String couponCode, BigDecimal purchaseAmount) {
        if (couponCode == null || couponCode.trim().isEmpty()) {
            return BigDecimal.ZERO;
        }

        Coupon coupon = couponRepository.findByCode(couponCode.trim().toUpperCase())
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND, "Invalid coupon code"));

        validateCoupon(coupon, purchaseAmount);

        BigDecimal discountAmount = BigDecimal.ZERO;
        
        if (coupon.getDiscountFixed() != null && coupon.getDiscountFixed().compareTo(BigDecimal.ZERO) > 0) {
            discountAmount = coupon.getDiscountFixed();
        } 
        else if (coupon.getDiscountPercentage() != null && coupon.getDiscountPercentage() > 0) {
            BigDecimal percentage = new BigDecimal(coupon.getDiscountPercentage()).divide(new BigDecimal(100), 4, RoundingMode.HALF_UP);
            discountAmount = purchaseAmount.multiply(percentage).setScale(0, RoundingMode.HALF_UP);
        } else {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Invalid coupon configuration");
        }

        if (coupon.getMaxDiscountAmount() != null && discountAmount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
            discountAmount = coupon.getMaxDiscountAmount();
        }

        coupon.setUsageCount(coupon.getUsageCount() + 1);
        couponRepository.save(coupon);

        return discountAmount;
    }

    private void validateCoupon(Coupon coupon, BigDecimal purchaseAmount) {
        LocalDateTime now = LocalDateTime.now();
        
        if (!coupon.getIsActive()) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "This coupon is not active");
        }
        
        if (coupon.getValidFrom() != null && now.isBefore(coupon.getValidFrom())) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "This coupon is not valid yet");
        }
        
        if (coupon.getUsageLimit() != null && coupon.getUsageCount() >= coupon.getUsageLimit()) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "This coupon has reached its usage limit");
        }
    }
}