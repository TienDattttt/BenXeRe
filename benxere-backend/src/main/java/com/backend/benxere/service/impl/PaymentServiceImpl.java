package com.backend.benxere.service.impl;

import com.backend.benxere.dto.request.PaymentRequest;
import com.backend.benxere.dto.response.PaymentResponse;
import com.backend.benxere.dto.response.ZaloPayCallbackResponse;
import com.backend.benxere.entity.Payment;
import com.backend.benxere.entity.enums.PaymentMethod;
import com.backend.benxere.entity.enums.PaymentStatus;
import com.backend.benxere.entity.User;
import com.backend.benxere.entity.Booking;
import com.backend.benxere.mapper.PaymentMapper;
import com.backend.benxere.repository.PaymentRepository;
import com.backend.benxere.repository.UserRepository;
import com.backend.benxere.repository.BookingRepository;
import com.backend.benxere.repository.SeatRepository;
import com.backend.benxere.service.PaymentService;
import com.backend.benxere.service.BookingService;
import com.backend.benxere.service.payment.MomoService;
import com.backend.benxere.service.payment.VNPayService;
import com.backend.benxere.service.payment.ZaloPayService;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Lazy;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;

@Service
@Primary
public class PaymentServiceImpl implements PaymentService {
    private static final Logger logger = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final PaymentMapper paymentMapper;
    private final ZaloPayService zaloPayService;
    private final MomoService momoService;
    private final VNPayService vnPayService;
    private final BookingService bookingService;
    private final BookingRepository bookingRepository;
    private final SeatRepository seatRepository;

    public PaymentServiceImpl(PaymentRepository paymentRepository,
                            UserRepository userRepository,
                            PaymentMapper paymentMapper,
                            ZaloPayService zaloPayService,
                            MomoService momoService,
                            VNPayService vnPayService,
                            @Lazy BookingService bookingService,
                            BookingRepository bookingRepository,
                            SeatRepository seatRepository) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.paymentMapper = paymentMapper;
        this.zaloPayService = zaloPayService;
        this.momoService = momoService;
        this.vnPayService = vnPayService;
        this.bookingService = bookingService;
        this.bookingRepository = bookingRepository;
        this.seatRepository = seatRepository;
    }

    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getPaymentMethod() == PaymentMethod.CASH) {
            logger.info("Processing CASH payment for user: {}, amount: {}", userEmail, request.getAmountAsLong());
            
            try {
                Booking booking = bookingRepository.findById(request.getRelatedEntityId())
                    .orElseThrow(() -> new RuntimeException("Booking not found: " + request.getRelatedEntityId()));
                
                booking.setTemporary(false);
                booking.setStatus(Booking.BookingStatus.Confirmed);
                
                Payment cashPayment = new Payment();
                cashPayment.setUser(user);
                cashPayment.setAmount(request.getAmountAsLong());
                cashPayment.setEntityType(request.getEntityType().toString());
                cashPayment.setRelatedEntityId(request.getRelatedEntityId());
                cashPayment.setPaymentMethod(PaymentMethod.CASH);
                cashPayment.setPaymentStatus(PaymentStatus.COMPLETED);
                cashPayment.setPaymentDate(Timestamp.from(Instant.now()));
                cashPayment.setTransId("CASH_" + booking.getBookingId() + "_" + System.currentTimeMillis());
                
                cashPayment = paymentRepository.save(cashPayment);
                
                bookingService.confirmBooking(cashPayment);
                
                logger.info("Confirmed booking {} for CASH payment with QR codes generated", booking.getBookingId());
                
                return PaymentResponse.builder()
                    .paymentId(cashPayment.getPaymentId())
                    .amount(request.getAmountAsLong())
                    .status(PaymentStatus.COMPLETED)
                    .paymentMethod(PaymentMethod.CASH)
                    .transId(cashPayment.getTransId())
                    .message("Cash payment processed successfully. Booking confirmed with QR codes.")
                    .build();
            } catch (Exception e) {
                logger.error("Failed to process CASH payment: {}", e.getMessage(), e);
                throw new RuntimeException("Failed to process CASH payment: " + e.getMessage(), e);
            }
        }

        Payment payment = new Payment();
        payment.setUser(user);
        payment.setAmount(request.getAmountAsLong());
        payment.setEntityType(request.getEntityType().toString());
        payment.setRelatedEntityId(request.getRelatedEntityId());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentStatus(PaymentStatus.PENDING);
        payment.setPaymentDate(Timestamp.from(Instant.now()));

        payment = paymentRepository.save(payment);
        final Payment savedPayment = payment;

        Map<String, String> providerResponse;
        try {
            switch (request.getPaymentMethod()) {
                case ZALOPAY:
                    providerResponse = zaloPayService.createPayment(payment);
                    break;
                case MOMO:
                    providerResponse = momoService.createPayment(payment);
                    break;
                case VNPAY:
                    providerResponse = vnPayService.createPayment(payment);
                    break;
                default:
                    throw new RuntimeException("Unsupported payment method");
            }

            String transId = providerResponse.getOrDefault("orderId",
                           providerResponse.getOrDefault("transId", ""));
            payment.setTransId(transId);
            payment = paymentRepository.save(payment);

            return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .amount(payment.getAmount())
                .status(payment.getPaymentStatus())
                .paymentMethod(payment.getPaymentMethod())
                .paymentUrl(providerResponse.get("paymentUrl"))
                .transId(transId)
                .message("Payment created successfully")
                .build();

        } catch (Exception e) {
            savedPayment.setPaymentStatus(PaymentStatus.FAILED);
            paymentRepository.save(savedPayment);
            throw new RuntimeException("Failed to create payment: " + e.getMessage(), e);
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
            .paymentMethod(payment.getPaymentMethod())
            .transId(payment.getTransId())
            .message("Payment status retrieved successfully")
            .build();
    }

    @Override
    @Transactional
    public PaymentResponse handlePaymentCallback(String paymentMethod, String requestData) {
        try {
            PaymentMethod method = PaymentMethod.valueOf(paymentMethod.toUpperCase());
            logger.info("Processing payment callback for method: {}", method);
            
            switch (method) {
                case ZALOPAY:
                    ZaloPayCallbackResponse zaloPayResponse = zaloPayService.processCallback(requestData, null);
                    logger.debug("ZaloPay callback response: {}", zaloPayResponse);
                    
                    if (zaloPayResponse.getReturnCode() == 1) {
                        String transactionId = zaloPayResponse.getTransactionId();
                        Payment payment = paymentRepository.findByTransId(transactionId)
                            .orElseThrow(() -> new RuntimeException("Payment not found for transaction: " + transactionId));
                        
                        payment.setPaymentStatus(PaymentStatus.COMPLETED);
                        payment = paymentRepository.save(payment);
                        
                        try {
                            bookingService.confirmBooking(payment);
                            logger.info("Successfully confirmed booking for payment ID: {}", payment.getPaymentId());
                        } catch (Exception e) {
                            logger.error("Failed to confirm booking for payment ID: {}", payment.getPaymentId(), e);
                            payment.setPaymentStatus(PaymentStatus.FAILED);
                            paymentRepository.save(payment);
                            throw new RuntimeException("Failed to confirm booking: " + e.getMessage(), e);
                        }
                        
                        return PaymentResponse.builder()
                            .paymentId(payment.getPaymentId())
                            .amount(payment.getAmount())
                            .status(payment.getPaymentStatus())
                            .paymentMethod(payment.getPaymentMethod())
                            .transId(payment.getTransId())
                            .message("Payment completed successfully")
                            .build();
                    } else {
                        String transactionId = zaloPayResponse.getTransactionId();
                        if (transactionId != null) {
                            Payment payment = paymentRepository.findByTransId(transactionId)
                                .orElseThrow(() -> new RuntimeException("Payment not found for transaction: " + transactionId));
                            payment.setPaymentStatus(PaymentStatus.FAILED);
                            paymentRepository.save(payment);
                            bookingService.deleteBooking(payment.getRelatedEntityId());
                        }
                        throw new RuntimeException("Payment verification failed: " + zaloPayResponse.getReturnMessage());
                    }

                case MOMO:
                    JSONObject momoData = new JSONObject(requestData);
                    Map<String, Object> momoResult = momoService.processCallback(
                        momoData.optString("requestId", ""),
                        momoData.optString("orderId", ""),
                        momoData.optString("amount", "0"),
                        momoData.optString("orderInfo", ""),
                        momoData.optString("orderType", "momo_wallet"),
                        momoData.optString("transId", ""),
                        momoData.optString("resultCode", ""),
                        momoData.optString("message", ""),
                        momoData.optString("payType", ""),
                        momoData.optString("extraData", ""),
                        momoData.optString("signature", "")
                    );
                    return handleGenericPaymentResult(momoResult);

                case VNPAY:
                    JSONObject jsonData = new JSONObject(requestData);
                    Map<String, String> vnpParams = new HashMap<>();
                    jsonData.keys().forEachRemaining(key -> vnpParams.put(key, jsonData.getString(key)));
                    Map<String, Object> vnpayResult = vnPayService.processCallback(vnpParams);
                    return handleGenericPaymentResult(vnpayResult);

                default:
                    throw new RuntimeException("Unsupported payment method: " + method);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to process payment callback: " + e.getMessage(), e);
        }
    }

    private PaymentResponse handleGenericPaymentResult(Map<String, Object> result) {
        if (!(boolean) result.get("success")) {
            throw new RuntimeException("Payment verification failed: " + result.get("error"));
        }

        String transactionId = (String) result.get("transId");
        Payment payment = paymentRepository.findByTransId(transactionId)
            .orElseThrow(() -> new RuntimeException("Payment not found for transaction: " + transactionId));

        payment.setPaymentStatus(PaymentStatus.COMPLETED);
        payment = paymentRepository.save(payment);

        try {
            bookingService.confirmBooking(payment);
            logger.info("Successfully confirmed booking for payment ID: {}", payment.getPaymentId());
        } catch (Exception e) {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new RuntimeException("Failed to confirm booking: " + e.getMessage(), e);
        }

        return PaymentResponse.builder()
            .paymentId(payment.getPaymentId())
            .amount(payment.getAmount())
            .status(payment.getPaymentStatus())
            .paymentMethod(payment.getPaymentMethod())
            .transId(payment.getTransId())
            .message("Payment completed successfully")
            .build();
    }

    @Override
    @Transactional
    public void deleteOldPendingPayments() {
        Timestamp threshold = Timestamp.from(Instant.now().minus(30, ChronoUnit.MINUTES));
        List<Payment> oldPayments = paymentRepository.findByPaymentStatusAndPaymentDateBefore(
                PaymentStatus.PENDING, threshold);
        
        if (!oldPayments.isEmpty()) {
            logger.info("Deleting {} old pending payments", oldPayments.size());
            paymentRepository.deleteAll(oldPayments);
        }
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