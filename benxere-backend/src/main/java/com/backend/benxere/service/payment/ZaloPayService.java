package com.backend.benxere.service.payment;

import com.backend.benxere.configuration.ZaloPayConfig;
import com.backend.benxere.dto.response.ZaloPayCallbackResponse;
import com.backend.benxere.entity.Payment;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
@Qualifier("zaloPayProvider")
public class ZaloPayService implements IZaloPayService {
    private static final Logger logger = LoggerFactory.getLogger(ZaloPayService.class);
    private final ZaloPayConfig config;
    private final RestTemplate restTemplate;

    public ZaloPayService(ZaloPayConfig config) {
        this.config = config;
        this.restTemplate = new RestTemplate();
    }

    @Override
    public Map<String, String> createPayment(Payment payment) {
        Map<String, String> response = new HashMap<>();
        
        try {
            if (payment.getAmount() < 1000) {
                throw new RuntimeException("Amount must be at least 1000 VND");
            }
            
            String appTransId = generateAppTransId();
            Map<String, Object> params = new HashMap<>();
            params.put("app_id", Long.parseLong(config.getAppId()));
            params.put("app_trans_id", appTransId);
            params.put("app_time", System.currentTimeMillis());
            params.put("app_user", payment.getUser().getEmail());
            params.put("amount", payment.getAmount()); 
            params.put("description", "Thanh toan don hang #" + payment.getPaymentId());
            params.put("bank_code", "");
            params.put("redirect_url", config.getReturnUrl());
            params.put("callback_url", config.getCallbackUrl());
            
            Map<String, String> embedData = new HashMap<>();
            embedData.put("embed_data", "");            
            
            String embedDataStr = new JSONObject(embedData).toString();
            params.put("embed_data", embedDataStr);
            params.put("item", "[]");
            
            StringBuilder macData = new StringBuilder();
            macData.append(config.getAppId())
                   .append("|").append(appTransId)
                   .append("|").append(params.get("app_user"))
                   .append("|").append(payment.getAmount())
                   .append("|").append(params.get("app_time"))
                   .append("|").append(embedDataStr)
                   .append("|").append("[]");
            
            String mac = hmacSHA256(macData.toString(), config.getKey1());
            params.put("mac", mac);
            
            logger.debug("Creating ZaloPay payment with params: {}", params);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(params, headers);
            String createOrderUrl = config.getEndpoint() + "/create";
            Map<String, Object> result = restTemplate.postForObject(createOrderUrl, request, Map.class);
            
            logger.info("ZaloPay API response: {}", result);
            
            if (result != null && Integer.valueOf(1).equals(result.get("return_code"))) {
                response.put("status", "success");
                response.put("paymentUrl", (String) result.get("order_url"));
                response.put("transId", appTransId);
            } else {
                String error = String.format("ZaloPay API error: return_code=%s, message=%s",
                    result != null ? result.get("return_code") : "null",
                    result != null ? result.get("return_message") : "No response");
                throw new RuntimeException(error);
            }
            
            return response;
        } catch (Exception e) {
            logger.error("Failed to create ZaloPay payment", e);
            throw new RuntimeException("Failed to create ZaloPay payment: " + e.getMessage(), e);
        }
    }

    @Override
    public ZaloPayCallbackResponse processCallback(String requestData, String receivedMac) {
        try {
            JSONObject callbackData = new JSONObject(requestData);
            logger.info("Processing ZaloPay callback data: {}", callbackData.toString());
            
            if (callbackData.has("data") && callbackData.has("mac") && callbackData.has("type")) {
                String dataStr = callbackData.getString("data");
                
                if (receivedMac == null) {
                    receivedMac = callbackData.getString("mac");
                }
                
                String calculatedMac = hmacSHA256(dataStr, config.getKey2());
                logger.info("MAC verification: Calculated={}, Received={}", calculatedMac, receivedMac);
                
                if (!calculatedMac.equals(receivedMac)) {
                    logger.error("MAC verification failed");
                    return ZaloPayCallbackResponse.invalidMac();
                }
                
                logger.info("MAC verification successful");
                
                JSONObject dataObj = new JSONObject(dataStr);
                
                String appTransId = dataObj.getString("app_trans_id");
                long amount = dataObj.getLong("amount");
                long zpTransId = dataObj.getLong("zp_trans_id");
                
                logger.info("Payment processed successfully. Amount: {}, Transaction ID: {}", amount, appTransId);
                return ZaloPayCallbackResponse.success(appTransId, zpTransId, amount);
            } else {
                logger.warn("Received data is not in standard ZaloPay callback format. Trying to process as inner data object.");
                
                String appTransId = callbackData.optString("app_trans_id", null);
                if (appTransId == null) {
                    logger.error("Missing app_trans_id in data");
                    return ZaloPayCallbackResponse.error("Invalid data format - missing app_trans_id");
                }
                
                long amount = callbackData.optLong("amount", 0);
                long zpTransId = callbackData.optLong("zp_trans_id", 0);
                
                logger.info("Payment processed as direct data. Amount: {}, Transaction ID: {}", amount, appTransId);
                return ZaloPayCallbackResponse.success(appTransId, zpTransId, amount);
            }
        } catch (Exception e) {
            logger.error("Failed to process callback: {}", e.getMessage(), e);
            return ZaloPayCallbackResponse.error(e.getMessage());
        }
    }

    private String generateAppTransId() {
        SimpleDateFormat format = new SimpleDateFormat("yyMMdd_HHmmss");
        return format.format(new Date()) + "_" + UUID.randomUUID().toString().substring(0, 8);
    }

    private String hmacSHA256(String data, String key) throws NoSuchAlgorithmException, InvalidKeyException {
        try {
            Mac hmacSHA256 = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            hmacSHA256.init(secretKey);
            
            byte[] hashBytes = hmacSHA256.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(hashBytes.length * 2);
            for (byte b : hashBytes) {
                hexString.append(String.format("%02x", b & 0xff));
            }
            
            String result = hexString.toString();
            logger.debug("HMAC calculation complete - Input length: {}, Output length: {}", 
                        data.length(), result.length());
            return result;
        } catch (Exception e) {
            logger.error("Error calculating HMAC", e);
            throw e;
        }
    }
}