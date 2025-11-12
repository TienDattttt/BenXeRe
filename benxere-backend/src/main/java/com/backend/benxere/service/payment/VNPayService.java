package com.backend.benxere.service.payment;

import com.backend.benxere.configuration.VNPayConfig;
import com.backend.benxere.entity.Payment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VNPayService {
    private static final Logger logger = LoggerFactory.getLogger(VNPayService.class);
    private final VNPayConfig.VNPayProperties config;
    private final RestTemplate restTemplate;

    public VNPayService(VNPayConfig paymentConfig) {
        this.config = paymentConfig.getVnpay();
        this.restTemplate = new RestTemplate();
    }

    public Map<String, String> createPayment(Payment payment) {
        Map<String, String> response = new HashMap<>();
        try {
            String vnp_TxnRef = payment.getPaymentId() + "_" + System.currentTimeMillis();
            String vnp_TmnCode = config.getTmnCode();
            String vnp_OrderInfo = "Thanh toan don hang #" + payment.getPaymentId();
            String vnp_OrderType = "190000";
            String vnp_IpAddr = "127.0.0.1"; 
            String vnp_CreateDate = getCreateDate();
            
            logger.info("Creating VNPay payment for paymentId={}, amount={}", 
                    payment.getPaymentId(), payment.getAmount());
            
            String baseUrl = config.getEndpoint();
            
            Map<String, String> vnpParams = new LinkedHashMap<>();
            vnpParams.put("vnp_Version", "2.1.0");
            vnpParams.put("vnp_Command", "pay");
            vnpParams.put("vnp_TmnCode", vnp_TmnCode);
            vnpParams.put("vnp_Amount", String.valueOf(Math.round(payment.getAmount() * 100))); 
            vnpParams.put("vnp_CurrCode", "VND");
            vnpParams.put("vnp_BankCode", "");
            vnpParams.put("vnp_CreateDate", vnp_CreateDate);
            vnpParams.put("vnp_IpAddr", vnp_IpAddr);
            vnpParams.put("vnp_Locale", "vn");
            vnpParams.put("vnp_OrderInfo", vnp_OrderInfo);
            vnpParams.put("vnp_OrderType", vnp_OrderType);
            vnpParams.put("vnp_ReturnUrl", config.getReturnUrl());
            vnpParams.put("vnp_TxnRef", vnp_TxnRef);
            
            payment.setTransId(vnp_TxnRef);
            
            logger.debug("VNPay parameters before hash: {}", vnpParams);
            
            String secureHash = generateSecureHash(vnpParams);
            vnpParams.put("vnp_SecureHash", secureHash);
            
            logger.debug("Generated VNPay secure hash: {}", secureHash);
            
            StringBuilder queryBuilder = new StringBuilder();
            for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
                if (queryBuilder.length() > 0) {
                    queryBuilder.append('&');
                }
                queryBuilder.append(entry.getKey()).append('=').append(urlEncode(entry.getValue()));
            }
            
            String paymentUrl = baseUrl + "?" + queryBuilder.toString();
            logger.info("VNPay payment URL generated: {}", paymentUrl);
            
            response.put("paymentUrl", paymentUrl);
            response.put("orderId", vnp_TxnRef);

            return response;
        } catch (Exception e) {
            logger.error("Failed to create VNPay payment: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create VNPay payment", e);
        }
    }

    public boolean verifyPayment(Map<String, String> vnpParams) {
        try {
            Map<String, String> params = new HashMap<>(vnpParams);
            String vnp_SecureHash = params.remove("vnp_SecureHash");
            
            if (vnp_SecureHash == null) {
                logger.error("No secure hash found in VNPay response");
                return false;
            }
            
            logger.debug("VNPay parameters for verification: {}", params);
            String secureHash = generateSecureHash(params);
            logger.debug("Calculated hash: {}, Received hash: {}", secureHash, vnp_SecureHash);
            
            return secureHash.equals(vnp_SecureHash);
        } catch (Exception e) {
            logger.error("Error verifying VNPay payment: {}", e.getMessage(), e);
            return false;
        }
    }

    public Map<String, Object> processCallback(Map<String, String> vnpParams) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            if (verifyPayment(vnpParams)) {
                String vnp_ResponseCode = vnpParams.get("vnp_ResponseCode");
                String vnp_TxnRef = vnpParams.get("vnp_TxnRef");
                String vnp_Amount = vnpParams.get("vnp_Amount");
                String vnp_TransactionNo = vnpParams.get("vnp_TransactionNo");
                
                result.put("success", "00".equals(vnp_ResponseCode));
                result.put("orderId", vnp_TxnRef);
                result.put("amount", Long.parseLong(vnp_Amount) / 100); 
                result.put("transId", vnp_TransactionNo);
                result.put("message", getResponseMessage(vnp_ResponseCode));
                
                Map<String, String> responseData = new HashMap<>();
                responseData.put("RspCode", "00");
                responseData.put("Message", "Confirmed");
                result.put("response", responseData);
            } else {
                result.put("success", false);
                result.put("error", "Invalid signature");
                
                Map<String, String> responseData = new HashMap<>();
                responseData.put("RspCode", "97");
                responseData.put("Message", "Invalid signature");
                result.put("response", responseData);
            }
            
            return result;
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            
            Map<String, String> responseData = new HashMap<>();
            responseData.put("RspCode", "99");
            responseData.put("Message", "Unknown error");
            result.put("response", responseData);
            
            return result;
        }
    }
    
    public Map<String, String> refundPayment(String transactionNo, String transactionDate, long amount, String description) {
        Map<String, String> response = new HashMap<>();
        
        try {
            String vnp_TmnCode = config.getTmnCode();
            String vnp_CreateDate = getCreateDate();
            String vnp_TransactionType = "03"; 
            
            Map<String, String> vnpParams = new TreeMap<>();
            vnpParams.put("vnp_Version", "2.1.0");
            vnpParams.put("vnp_Command", "refund");
            vnpParams.put("vnp_TmnCode", vnp_TmnCode);
            vnpParams.put("vnp_TransactionType", vnp_TransactionType);
            vnpParams.put("vnp_TxnRef", generateTransactionRef());
            vnpParams.put("vnp_Amount", String.valueOf(Math.round(amount * 100))); 
            vnpParams.put("vnp_TransactionNo", transactionNo);
            vnpParams.put("vnp_TransactionDate", transactionDate);
            vnpParams.put("vnp_CreateDate", vnp_CreateDate);
            vnpParams.put("vnp_IpAddr", "127.0.0.1");
            vnpParams.put("vnp_OrderInfo", description);
            
            String secureHash = generateSecureHash(vnpParams);
            vnpParams.put("vnp_SecureHash", secureHash);
            
            String refundUrl = config.getEndpoint() + "/merchant_webapi/api/transaction";
            Map<String, String> result = restTemplate.postForObject(refundUrl, vnpParams, Map.class);
            
            if (result != null && "00".equals(result.get("vnp_ResponseCode"))) {
                response.put("status", "success");
                response.put("message", getResponseMessage(result.get("vnp_ResponseCode")));
                response.put("transactionNo", result.get("vnp_TransactionNo"));
            } else {
                response.put("status", "error");
                response.put("message", result != null ? getResponseMessage(result.get("vnp_ResponseCode")) : "Unknown error");
            }
            
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Failed to refund VNPay payment", e);
        }
    }

    private String generateTransactionRef() {
        return String.valueOf(System.currentTimeMillis());
    }

    private String getCreateDate() {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        return formatter.format(new Date());
    }

    private String generateSecureHash(Map<String, String> params) throws NoSuchAlgorithmException, InvalidKeyException {
        Map<String, String> sortedParams = new TreeMap<>(params);
        
        StringBuilder hashData = new StringBuilder();
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            String fieldName = entry.getKey();
            String fieldValue = entry.getValue();
            
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append('=').append(fieldValue).append('&');
            }
        }
        
        if (hashData.length() > 0) {
            hashData.setLength(hashData.length() - 1); 
        }

        String hashDataStr = hashData.toString();
        logger.debug("Raw hash data string: {}", hashDataStr);
        logger.debug("Hash secret key: {}", config.getHashSecret());

        Mac hmacSHA512 = Mac.getInstance("HmacSHA512");
        SecretKeySpec secretKey = new SecretKeySpec(config.getHashSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA512");
        hmacSHA512.init(secretKey);
        
        byte[] hashBytes = hmacSHA512.doFinal(hashDataStr.getBytes(StandardCharsets.UTF_8));
        return bytesToHex(hashBytes);
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString().toUpperCase();
    }

    private String urlEncode(String value) {
        try {
            return java.net.URLEncoder.encode(value, StandardCharsets.UTF_8.name())
                    .replace("+", "%20")
                    .replace("*", "%2A")
                    .replace("%7E", "~");
        } catch (Exception e) {
            return value;
        }
    }

    private String getResponseMessage(String responseCode) {
        Map<String, String> responseMessages = new HashMap<>();
        responseMessages.put("00", "Giao dịch thành công");
        responseMessages.put("07", "Trừ tiền thành công. Giao dịch bị nghi ngờ");
        responseMessages.put("09", "Giao dịch không thành công do: Thẻ/Tài khoản không đủ số dư");
        responseMessages.put("10", "Giao dịch không thành công do: Vượt quá hạn mức giao dịch");
        responseMessages.put("11", "Giao dịch không thành công do: Thẻ hết hạn/Thẻ bị khóa");
        responseMessages.put("12", "Giao dịch không thành công do: Thẻ/Tài khoản bị khóa");
        responseMessages.put("13", "Giao dịch không thành công do: Quý khách nhập sai mật khẩu");
        responseMessages.put("24", "Giao dịch không thành công do: Khách hàng hủy giao dịch");
        responseMessages.put("51", "Giao dịch không thành công do: Tài khoản không đủ số dư");
        responseMessages.put("65", "Giao dịch không thành công do: Tài khoản vượt quá hạn mức giao dịch");
        responseMessages.put("75", "Ngân hàng thanh toán đang bảo trì");
        responseMessages.put("79", "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định");
        responseMessages.put("99", "Các lỗi khác");
        
        return responseMessages.getOrDefault(responseCode, "Unknown response code: " + responseCode);
    }
}