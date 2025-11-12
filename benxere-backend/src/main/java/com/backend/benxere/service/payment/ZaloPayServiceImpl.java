package com.backend.benxere.service.payment;

import com.backend.benxere.dto.request.PaymentRequest;
import com.backend.benxere.dto.response.ZaloPayCallbackResponse;
import com.backend.benxere.entity.enums.PaymentMethod;
import com.backend.benxere.entity.enums.PaymentStatus;
import com.backend.benxere.service.BookingService;
import com.backend.benxere.dto.response.PaymentResponse;
import com.backend.benxere.entity.Payment;
import com.backend.benxere.entity.User;
import com.backend.benxere.repository.PaymentRepository;
import com.backend.benxere.repository.UserRepository;
import com.backend.benxere.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Map;

@Service("zaloPayPaymentService") 
public class ZaloPayServiceImpl implements PaymentService {
    private static final Logger logger = LoggerFactory.getLogger(ZaloPayServiceImpl.class);
    
    private final ZaloPayService zaloPayService;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final BookingService bookingService;

    public ZaloPayServiceImpl(@Qualifier("zaloPayProvider") ZaloPayService zaloPayService,
                           PaymentRepository paymentRepository,
                           UserRepository userRepository,
                           BookingService bookingService) {
        this.zaloPayService = zaloPayService;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.bookingService = bookingService;
    }

    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentRequest request, String userEmail) {
        Payment payment = null;
        try {
            User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

            payment = new Payment();
            payment.setAmount(request.getAmountAsLong());
            payment.setUser(user);
            payment.setEntityType(request.getEntityType().toString());
            payment.setRelatedEntityId(request.getRelatedEntityId());
            payment.setPaymentMethod(PaymentMethod.ZALOPAY);
            payment.setPaymentStatus(PaymentStatus.PENDING);
            payment.setPaymentDate(Timestamp.from(Instant.now()));
            
            payment = paymentRepository.save(payment);
            
            bookingService.createTemporaryBooking(payment);

            Map<String, String> zaloPayResponse = zaloPayService.createPayment(payment);

            payment.setTransId(zaloPayResponse.get("transId"));
            payment = paymentRepository.save(payment);

            return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .amount(payment.getAmount())
                .status(payment.getPaymentStatus())
                .paymentUrl(zaloPayResponse.get("paymentUrl"))
                .message("Payment created successfully")
                .build();

        } catch (Exception e) {
            logger.error("Failed to create ZaloPay payment", e);
            
            if (payment != null && payment.getPaymentId() != null) {
                payment.setPaymentStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
            }
            
            throw new RuntimeException("Failed to create ZaloPay payment: " + e.getMessage(), e);
        }
    }

    @Override
    public PaymentResponse getPaymentStatus(int paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new RuntimeException("Payment not found"));

        return PaymentResponse.builder()
            .paymentId(payment.getPaymentId())
            .amount(payment.getAmount())
            .status(payment.getPaymentStatus())
            .message("Payment status retrieved successfully")
            .build();
    }

    @Override
    @Transactional
    public PaymentResponse handlePaymentCallback(String paymentMethod, String requestData) {
        if (!"ZALOPAY".equals(paymentMethod)) {
            throw new RuntimeException("Invalid payment method for ZaloPay callback");
        }

        try {
            logger.info("Processing ZaloPay callback with data: {}", requestData);
            
            ZaloPayCallbackResponse callbackResult = zaloPayService.processCallback(requestData, null);

            if (callbackResult.getReturnCode() != 1) {
                logger.error("Payment verification failed: {}", callbackResult.getReturnMessage());
                throw new RuntimeException("Payment verification failed: " + callbackResult.getReturnMessage());
            }

            String transactionId = callbackResult.getTransactionId();
            logger.info("Looking up payment with transaction ID: {}", transactionId);
            
            Payment payment = paymentRepository.findByTransId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found for transaction: " + transactionId));
            
            logger.info("Found payment with ID: {}, current status: {}", payment.getPaymentId(), payment.getPaymentStatus());

            payment.setPaymentStatus(PaymentStatus.COMPLETED);
            payment = paymentRepository.save(payment);
            
            bookingService.confirmBooking(payment);
            
            logger.info("Successfully processed payment and confirmed booking for transId: {}", transactionId);

            return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .amount(payment.getAmount())
                .status(payment.getPaymentStatus())
                .message("Payment completed successfully")
                .build();

        } catch (Exception e) {
            logger.error("Failed to process ZaloPay callback: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process ZaloPay callback: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteOldPendingPayments() {
    }
    
    @Override
    public PaymentResponse getPaymentByRelatedEntityId(Integer relatedEntityId) {
        return paymentRepository.findByRelatedEntityId(relatedEntityId)
                .map(payment -> PaymentResponse.builder()
                        .paymentId(payment.getPaymentId())
                        .amount(payment.getAmount())
                        .status(payment.getPaymentStatus())
                        .paymentMethod(payment.getPaymentMethod())
                        .transId(payment.getTransId())
                        .build())
                .orElse(null);
    }
}