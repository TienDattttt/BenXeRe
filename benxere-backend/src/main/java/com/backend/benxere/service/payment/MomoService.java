package com.backend.benxere.service.payment;

import com.backend.benxere.configuration.VNPayConfig;
import com.backend.benxere.entity.Payment;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class MomoService {
    private static final Logger logger = LoggerFactory.getLogger(MomoService.class);

    private final VNPayConfig.MomoConfig config;
    private final RestTemplate restTemplate;

    public MomoService(VNPayConfig paymentConfig) {
        this.config = paymentConfig.getMomo();
        this.restTemplate = new RestTemplate();
    }

    public Map<String, String> createPayment(Payment payment) {
        Map<String, String> response = new HashMap<>();

        try {
            String requestId = UUID.randomUUID().toString();
            String orderId = "MOMO_" + payment.getPaymentId() + "_" + System.currentTimeMillis();
            String partnerCode = config.getPartnerCode();
            String accessKey = config.getAccessKey();
            String secretKey = config.getSecretKey();
            long amount = Math.round(payment.getAmount());

            String orderInfo = "Payment for ticket #" + payment.getPaymentId();

            Map<String, Object> extraDataMap = new HashMap<>();
            extraDataMap.put("paymentId", String.valueOf(payment.getPaymentId()));
            extraDataMap.put("entityType", payment.getEntityType());
            extraDataMap.put("relatedEntityId", String.valueOf(payment.getRelatedEntityId()));
            String extraDataJson = new JSONObject(extraDataMap).toString();
            String extraData = Base64.getEncoder().encodeToString(extraDataJson.getBytes(StandardCharsets.UTF_8));

            String ipnUrl = config.getCallbackUrl();
            String redirectUrl = config.getReturnUrl();
            
            String rawSignature = "accessKey=" + accessKey +
                    "&amount=" + amount +
                    "&extraData=" + extraData +
                    "&ipnUrl=" + ipnUrl +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&partnerCode=" + partnerCode +
                    "&redirectUrl=" + redirectUrl +
                    "&requestId=" + requestId +
                    "&requestType=captureWallet";

            logger.info("Raw signature string: {}", rawSignature);

            String signature = hmacSHA256(rawSignature, secretKey);
            logger.info("Generated signature: {}", signature);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("partnerCode", partnerCode);
            requestBody.put("accessKey", accessKey);
            requestBody.put("requestId", requestId);
            requestBody.put("amount", amount);
            requestBody.put("orderId", orderId);
            requestBody.put("orderInfo", orderInfo);
            requestBody.put("redirectUrl", redirectUrl);
            requestBody.put("ipnUrl", ipnUrl);
            requestBody.put("extraData", extraData);
            requestBody.put("requestType", "captureWallet");
            requestBody.put("lang", "vi");
            requestBody.put("signature", signature);

            String jsonRequestBody = new JSONObject(requestBody).toString();
            logger.info("MoMo request body: {}", jsonRequestBody);

            String paymentUrl = config.getEndpoint() + "/v2/gateway/api/create";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> request = new HttpEntity<>(jsonRequestBody, headers);
            ResponseEntity<String> apiResponse = restTemplate.postForEntity(paymentUrl, request, String.class);

            logger.info("MoMo response: {}", apiResponse.getBody());

            JSONObject jsonResponse = new JSONObject(apiResponse.getBody());

            int resultCode = jsonResponse.getInt("resultCode");
            if (resultCode == 0) {
                response.put("paymentUrl", jsonResponse.getString("payUrl"));
                response.put("orderId", orderId);
                response.put("requestId", requestId);
                response.put("status", "success");
            } else {
                response.put("status", "error");
                response.put("message", jsonResponse.getString("message"));
                response.put("resultCode", String.valueOf(resultCode));
            }
            return response;
        } catch (Exception e) {
            logger.error("Error creating MoMo payment", e);
            response.put("status", "error");
            response.put("message", e.getMessage());
            return response;
        }
    }


    private String hmacSHA256(String data, String key) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            byte[] hash = sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            logger.error("Error generating signature", e);
            throw new RuntimeException("Could not generate signature", e);
        }
    }

    public boolean verifyPayment(String requestId, String orderId, String amount, String orderInfo,
                                 String orderType, String transId, String resultCode, String message,
                                 String payType, String extraData, String signature) {
        try {
            String accessKey = config.getAccessKey();
            String secretKey = config.getSecretKey();

            String rawSignature = "accessKey=" + accessKey +
                    "&amount=" + amount +
                    "&extraData=" + extraData +
                    "&message=" + message +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&orderType=" + orderType +
                    "&partnerCode=" + config.getPartnerCode() +
                    "&payType=" + payType +
                    "&requestId=" + requestId +
                    "&resultCode=" + resultCode +
                    "&transId=" + transId;

            String checkSignature = hmacSHA256(rawSignature, secretKey);

            return checkSignature.equals(signature);
        } catch (Exception e) {
            return false;
        }
    }

    public Map<String, Object> processCallback(String requestId, String orderId, String amount,
                                               String orderInfo, String orderType, String transId,
                                               String resultCode, String message, String payType,
                                               String extraData, String signature) {
        Map<String, Object> result = new HashMap<>();

        try {
            if (verifyPayment(requestId, orderId, amount, orderInfo, orderType, transId,
                    resultCode, message, payType, extraData, signature)) {

                result.put("success", true);
                result.put("orderId", orderId);
                result.put("amount", amount);
                result.put("transId", transId);
                result.put("message", message);

                Map<String, String> responseData = new HashMap<>();
                responseData.put("partnerCode", config.getPartnerCode());
                responseData.put("orderId", orderId);
                responseData.put("requestId", requestId);
                responseData.put("message", "Success");
                responseData.put("resultCode", "0");

                result.put("response", responseData);
            } else {
                result.put("success", false);
                result.put("error", "Invalid signature");

                Map<String, String> responseData = new HashMap<>();
                responseData.put("resultCode", "1");
                responseData.put("message", "Invalid signature");
                result.put("response", responseData);
            }

            return result;
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());

            Map<String, String> responseData = new HashMap<>();
            responseData.put("resultCode", "99");
            responseData.put("message", "Error processing callback");
            result.put("response", responseData);

            return result;
        }
    }

    public Map<String, String> refundPayment(String orderId, String transId, long amount, String description) {
        Map<String, String> response = new HashMap<>();

        try {
            String requestId = UUID.randomUUID().toString();
            String partnerCode = config.getPartnerCode();
            String accessKey = config.getAccessKey();
            String secretKey = config.getSecretKey();

            Map<String, Object> refundData = new HashMap<>();
            refundData.put("partnerCode", partnerCode);
            refundData.put("orderId", orderId);
            refundData.put("requestId", requestId);
            refundData.put("amount", amount);
            refundData.put("transId", transId);
            refundData.put("lang", "vi");
            refundData.put("description", description);

            String rawSignature = "accessKey=" + accessKey +
                    "&amount=" + amount +
                    "&description=" + description +
                    "&orderId=" + orderId +
                    "&partnerCode=" + partnerCode +
                    "&requestId=" + requestId +
                    "&transId=" + transId;

            String signature = hmacSHA256(rawSignature, secretKey);
            refundData.put("signature", signature);

            String refundUrl = config.getEndpoint() + "/v2/gateway/api/refund";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(refundData, headers);
            ResponseEntity<String> apiResponse = restTemplate.postForEntity(refundUrl, request, String.class);

            JSONObject jsonResponse = new JSONObject(apiResponse.getBody());

            if ("0".equals(jsonResponse.getString("resultCode"))) {
                response.put("status", "success");
                response.put("message", jsonResponse.getString("message"));
                response.put("transId", jsonResponse.getString("transId"));
            } else {
                response.put("status", "error");
                response.put("message", jsonResponse.getString("message"));
            }

            return response;
        } catch (Exception e) {
            throw new RuntimeException("Failed to refund MoMo payment", e);
        }
    }
}