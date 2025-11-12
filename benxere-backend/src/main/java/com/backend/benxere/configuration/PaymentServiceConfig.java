package com.backend.benxere.configuration;

import com.backend.benxere.service.payment.ZaloPayService;
import com.backend.benxere.service.payment.MomoService;
import com.backend.benxere.service.payment.VNPayService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;

@Configuration
public class PaymentServiceConfig {

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getMessageConverters()
                .stream()
                .filter(StringHttpMessageConverter.class::isInstance)
                .findFirst()
                .ifPresent(converter -> {
                    int index = restTemplate.getMessageConverters().indexOf(converter);
                    restTemplate.getMessageConverters().set(
                            index, 
                            new StringHttpMessageConverter(StandardCharsets.UTF_8)
                    );
                });
        return restTemplate;
    }

    @Bean("zaloPayProvider")
    public ZaloPayService zaloPayService(ZaloPayConfig zaloPayConfig) {
        return new ZaloPayService(zaloPayConfig);
    }

    @Bean
    public MomoService momoService(VNPayConfig paymentConfig) {
        return new MomoService(paymentConfig);
    }

    @Bean
    public VNPayService vnPayService(VNPayConfig paymentConfig) {
        return new VNPayService(paymentConfig);
    }
}