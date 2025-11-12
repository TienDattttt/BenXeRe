package com.backend.benxere.controller;

import com.backend.benxere.configuration.VNPayConfig;
import com.backend.benxere.dto.request.ApiResponse;
import com.backend.benxere.dto.request.PaymentRequest;
import com.backend.benxere.dto.response.PaymentResponse;
import com.backend.benxere.entity.Payment;
import com.backend.benxere.entity.enums.PaymentStatus;
import com.backend.benxere.repository.PaymentRepository;
import com.backend.benxere.service.BookingService;
import com.backend.benxere.service.PaymentService;
import com.backend.benxere.service.payment.MomoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;
    private final MomoService momoService;
    private final PaymentRepository paymentRepository;
    private final BookingService bookingService;

    @Autowired
    private VNPayConfig paymentConfig;

    @PostMapping("/create")
    public ApiResponse<PaymentResponse> createPayment(@RequestBody PaymentRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        PaymentResponse paymentResponse = paymentService.createPayment(request, userEmail);
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentResponse)
                .build();
    }

    @GetMapping("/{paymentId}")
    public ApiResponse<PaymentResponse> getPaymentStatus(@PathVariable Integer paymentId) {
        PaymentResponse payment = paymentService.getPaymentStatus(paymentId);
        return ApiResponse.<PaymentResponse>builder()
                .result(payment)
                .build();
    }

    @PostMapping("/callback/zalopay")
    public ResponseEntity<?> zaloPayCallback(@RequestBody String requestData) {
        JSONObject result = new JSONObject();

        try {
            logger.info("Received ZaloPay callback: {}", requestData);

            JSONObject cbdata = new JSONObject(requestData);
            String dataStr = cbdata.getString("data");
            String reqMac = cbdata.getString("mac");

            String key2 = paymentConfig.getZalopay().getKey2();

            Mac hmacSHA256 = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(key2.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            hmacSHA256.init(secretKey);

            logger.debug("Raw callback data: {}", requestData);
            logger.debug("Data string for MAC: {}", dataStr);

            byte[] hashBytes = hmacSHA256.doFinal(dataStr.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = String.format("%02x", b);
                hexString.append(hex);
            }
            String mac = hexString.toString();

            logger.debug("Key2 used for verification: {}", key2);
            logger.debug("Calculated MAC: {}", mac);

            if (!reqMac.equals(mac)) {
                logger.error("Invalid MAC in ZaloPay callback. Expected: {}, Received: {}", mac, reqMac);
                result.put("return_code", -1);
                result.put("return_message", "mac not equal");            } else {
                JSONObject data = new JSONObject(dataStr);
                String appTransId = data.getString("app_trans_id");
                logger.info("Valid ZaloPay callback received for transaction: {}", appTransId);

                try {
                    paymentService.handlePaymentCallback("ZALOPAY", requestData);
                    logger.info("Successfully processed ZaloPay callback for transaction: {}", appTransId);
                    result.put("return_code", 1);
                    result.put("return_message", "success");
                } catch (Exception e) {
                    logger.error("Error processing ZaloPay payment callback: {}", e.getMessage(), e);
                    result.put("return_code", 0);
                    result.put("return_message", "Failed to process payment: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            logger.error("Error processing ZaloPay callback: {}", e.getMessage(), e);
            result.put("return_code", 0);
            result.put("return_message", e.getMessage());
        }

        return ResponseEntity.ok(result.toString());
    }

    @PostMapping("/callback/momo")
    public ResponseEntity<Map<String, String>> momoCallback(@RequestBody Map<String, Object> payload) {
        try {
            log.info("Received MoMo callback with payload: {}", payload);
            
            JSONObject momoData = new JSONObject(payload);
            
            String orderId = momoData.optString("orderId", "");
            String transId = momoData.optString("transId", "");
            String resultCode = momoData.optString("resultCode", "");
            
            log.info("Processing MoMo callback: orderId={}, transId={}, resultCode={}", orderId, transId, resultCode);
            
            String requestData = momoData.toString();
            paymentService.handlePaymentCallback("MOMO", requestData);
            
            Map<String, String> response = new HashMap<>();
            response.put("partnerCode", momoData.optString("partnerCode", ""));
            response.put("orderId", orderId);
            response.put("resultCode", "0");
            response.put("message", "Success");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing MoMo callback: {}", e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", "1");
            errorResponse.put("message", "Error: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.OK).body(errorResponse);
        }
    }

    @GetMapping("/return/momo")
    public RedirectView momoReturn(
            @RequestParam String partnerCode,
            @RequestParam String orderId,
            @RequestParam String requestId,
            @RequestParam String amount,
            @RequestParam String orderInfo,
            @RequestParam(required = false) String orderType,
            @RequestParam(required = false) String transId,
            @RequestParam String resultCode,
            @RequestParam String message,
            @RequestParam(required = false) String payType,
            @RequestParam(required = false) String extraData,
            @RequestParam String signature) {

        log.info("Received MoMo return: orderId={}, resultCode={}, message={}", orderId, resultCode, message);
        
        try {
            CompletableFuture.runAsync(() -> {
                try {
                    if ("0".equals(resultCode) || message.contains("Thành công") || message.contains("Thαnh c⌠ng")) {
                        log.info("Processing successful MoMo payment: orderId={}, transId={}", orderId, transId);
                        
                        String[] orderIdParts = orderId.split("_");
                        if (orderIdParts.length > 1) {
                            try {
                                int paymentId = Integer.parseInt(orderIdParts[1]);
                                Payment payment = paymentRepository.findById(paymentId).orElse(null);
                                
                                if (payment != null) {
                                    payment.setPaymentStatus(PaymentStatus.COMPLETED);
                                    if (transId != null && !transId.isEmpty()) {
                                        payment.setTransId(transId);
                                    }
                                    paymentRepository.save(payment);
                                    
                                    bookingService.confirmBooking(payment);
                                    log.info("Successfully confirmed booking for payment ID: {}", payment.getPaymentId());
                                } else {
                                    log.error("Payment not found for paymentId: {} from orderId: {}", orderIdParts[1], orderId);
                                }
                            } catch (NumberFormatException e) {
                                log.error("Failed to parse payment ID from orderId: {}", orderId, e);
                            }
                        } else {
                            log.error("Invalid orderId format: {}", orderId);
                        }
                    } else {
                        log.warn("MoMo payment was not successful: resultCode={}, message={}", resultCode, message);
                    }
                } catch (Exception e) {
                    log.error("Error processing MoMo payment return: {}", e.getMessage(), e);
                }
            });
              return new RedirectView("http://localhost:3000/account/orders");
        } catch (Exception e) {
            log.error("Error in momoReturn endpoint: {}", e.getMessage(), e);
            return new RedirectView("http://localhost:3000/account/orders");
        }
    }

    @GetMapping("/return/zalopay")
    public RedirectView zaloPayReturn(
            @RequestParam(required = false) String apptransid,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String amount,
            @RequestParam(required = false) String pmcid) {
        
        log.info("Received ZaloPay return: apptransid={}, status={}, amount={}, pmcid={}", 
                apptransid, status, amount, pmcid);
        
        try {
            CompletableFuture.runAsync(() -> {
                try {
                    if ("1".equals(status) && apptransid != null) {
                        log.info("Processing successful ZaloPay payment: apptransid={}", apptransid);
                        
                        Payment payment = paymentRepository.findByTransId(apptransid).orElse(null);
                        
                        if (payment != null) {
                            if (payment.getPaymentStatus() != PaymentStatus.COMPLETED) {
                                payment.setPaymentStatus(PaymentStatus.COMPLETED);
                                paymentRepository.save(payment);
                                
                                bookingService.confirmBooking(payment);
                                log.info("Successfully confirmed booking for ZaloPay payment ID: {}", payment.getPaymentId());
                            } else {
                                log.info("Payment already processed: {}", payment.getPaymentId());
                            }
                        } else {
                            log.error("Payment not found for ZaloPay transaction: {}", apptransid);
                        }
                    } else {
                        log.warn("ZaloPay payment was not successful: status={}, apptransid={}", status, apptransid);
                    }
                } catch (Exception e) {
                    log.error("Error processing ZaloPay payment return: {}", e.getMessage(), e);
                }
            });
            
            return new RedirectView("http://localhost:3000/payment-result");
        } catch (Exception e) {
            log.error("Error in zaloPayReturn endpoint: {}", e.getMessage(), e);
            return new RedirectView("http://localhost:3000/payment-result");
        }
    }

    @PostMapping("/callback/vnpay")
    public ResponseEntity<Map<String, String>> vnpayCallback(@RequestParam Map<String, String> params) {
        log.info("Received VNPay callback with params: {}", params);
        
        Map<String, String> response = new HashMap<>();
        try {
            JSONObject vnpayData = new JSONObject();
            for (Map.Entry<String, String> entry : params.entrySet()) {
                vnpayData.put(entry.getKey(), entry.getValue());
            }
            
            String requestData = vnpayData.toString();
            CompletableFuture.runAsync(() -> {
                try {
                    paymentService.handlePaymentCallback("VNPAY", requestData);
                } catch (Exception e) {
                    log.error("Error processing VNPay payment callback: {}", e.getMessage(), e);
                }
            });
            
            response.put("RspCode", "00");
            response.put("Message", "Confirmed");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing VNPay callback: {}", e.getMessage(), e);
            
            response.put("RspCode", "99");
            response.put("Message", "Error: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.OK).body(response);
        }
    }

    @GetMapping("/return/vnpay")
    public RedirectView vnpayReturn(@RequestParam Map<String, String> params) {
        log.info("Received VNPay return with params: {}", params);
        
        try {
            CompletableFuture.runAsync(() -> {
                try {
                    String vnp_ResponseCode = params.get("vnp_ResponseCode");
                    String vnp_TxnRef = params.get("vnp_TxnRef");
                    String vnp_TransactionNo = params.get("vnp_TransactionNo");
                    
                    if ("00".equals(vnp_ResponseCode)) {
                        log.info("Processing successful VNPay payment: txnRef={}, transactionNo={}", vnp_TxnRef, vnp_TransactionNo);
                        
                        if (vnp_TxnRef != null) {
                            try {
                                Payment payment = paymentRepository.findByTransId(vnp_TxnRef).orElse(null);
                                
                                if (payment != null) {
                                    payment.setPaymentStatus(PaymentStatus.COMPLETED);
                                    if (vnp_TransactionNo != null && !vnp_TransactionNo.isEmpty()) {
                                        payment.setTransId(vnp_TransactionNo);
                                    }
                                    paymentRepository.save(payment);
                                    
                                    bookingService.confirmBooking(payment);
                                    log.info("Successfully confirmed booking for payment ID: {}", payment.getPaymentId());
                                } else {
                                    log.error("Payment not found for transaction reference: {}", vnp_TxnRef);
                                }
                            } catch (Exception e) {
                                log.error("Failed to process payment return: {}", e.getMessage(), e);
                            }
                        } else {
                            log.error("Invalid transaction reference");
                        }
                    } else {
                        log.warn("VNPay payment was not successful: responseCode={}", vnp_ResponseCode);
                    }
                } catch (Exception e) {
                    log.error("Error processing VNPay payment return: {}", e.getMessage(), e);
                }
            });
            
            return new RedirectView("http://localhost:3000/account/orders");
        } catch (Exception e) {
            log.error("Error in vnpayReturn endpoint: {}", e.getMessage(), e);
            return new RedirectView("http://localhost:3000/account/orders");
        }
    }

    @GetMapping("/callback/vnpay")
    public ResponseEntity<PaymentResponse> vnPayCallback(@RequestParam String vnp_ResponseCode,
                                                          @RequestParam String vnp_TransactionNo,
                                                          @RequestParam String vnp_Amount,
                                                          @RequestParam String vnp_OrderInfo,
                                                          @RequestParam String vnp_BankCode,
                                                          @RequestParam String vnp_PayDate) {
        logger.info("Received VNPay callback for transaction: {}", vnp_TransactionNo);

        String requestData = String.format("responseCode=%s&transactionNo=%s&amount=%s&orderInfo=%s&bankCode=%s&payDate=%s",
                vnp_ResponseCode, vnp_TransactionNo, vnp_Amount, vnp_OrderInfo, vnp_BankCode, vnp_PayDate);
        PaymentResponse response = paymentService.handlePaymentCallback("VNPAY", requestData);

        logger.info("VNPay callback processed successfully for payment: {}", response.getPaymentId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/process-result")
    public ResponseEntity<PaymentResponse> processPaymentResult(
            @RequestParam String orderId,
            @RequestParam String resultCode,
            @RequestParam String message,
            @RequestParam String amount) {
        
        logger.info("Processing payment result: orderId={}, resultCode={}, message={}", orderId, resultCode, message);
        
        try {
            String[] orderIdParts = orderId.split("_");
            String transactionId = orderId;
            
            Payment payment = paymentRepository.findByTransId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found for transaction: " + transactionId));
            
            if ("0".equals(resultCode) || "Thành công.".equals(message)) {
                logger.info("Updating payment {} to CONFIRMED status", payment.getPaymentId());
                
                payment.setPaymentStatus(PaymentStatus.COMPLETED);
                payment = paymentRepository.save(payment);
                
                try {
                    bookingService.confirmBooking(payment);
                    logger.info("Successfully confirmed booking for payment ID: {}", payment.getPaymentId());
                } catch (Exception e) {
                    logger.error("Failed to confirm booking for payment ID: {}", payment.getPaymentId(), e);
                    throw new RuntimeException("Failed to confirm booking: " + e.getMessage(), e);
                }
            }
            
            return ResponseEntity.ok(PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .amount(payment.getAmount())
                .status(payment.getPaymentStatus())
                .paymentMethod(payment.getPaymentMethod())
                .transId(payment.getTransId())
                .message("Payment result processed")
                .build());
                
        } catch (Exception e) {
            logger.error("Error processing payment result: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process payment result: " + e.getMessage(), e);
        }
    }
}