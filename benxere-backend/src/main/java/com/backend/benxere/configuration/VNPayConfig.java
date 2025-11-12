package com.backend.benxere.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

@Configuration
@ConfigurationProperties(prefix = "payment")
@Data
public class VNPayConfig {
    private final ZaloPayConfig zalopay = new ZaloPayConfig();
    private final MomoConfig momo = new MomoConfig();
    private final VNPayProperties vnpay = new VNPayProperties();

    @Data
    public static class ZaloPayConfig {
        private String appId;
        private String key1;
        private String key2;
        private String endpoint;
        private String callbackUrl;
        private String returnUrl;
    }

    @Data
    public static class MomoConfig {
        private String partnerCode;
        private String accessKey;
        private String secretKey;
        private String endpoint;
        private String callbackUrl;
        private String returnUrl;
    }

    @Data
    public static class VNPayProperties {
        private String tmnCode = "Z4I8W8D3";
        private String hashSecret = "UGA3JNKWWYGK31NTFR798WLOAJSI6ABG";
        private String endpoint = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
        private String returnUrl;
    }
}