package com.backend.benxere.service;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.stereotype.Service;

import com.backend.benxere.entity.OtpToken;
import com.backend.benxere.exception.AppException;
import com.backend.benxere.exception.ErrorCode;
import com.backend.benxere.repository.OtpTokenRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OtpService {
    private final OtpTokenRepository otpTokenRepository;
    private final EmailService emailService;
    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 5;

    public void generateAndSendOtp(String email) {
        String otp = generateOtp();
        OtpToken otpToken = OtpToken.builder()
                .email(email)
                .otp(otp)
                .expiryDate(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .used(false)
                .build();
        
        otpTokenRepository.save(otpToken);
        emailService.sendOtpEmail(email, otp);
    }

    public void validateOtp(String email, String otp) {
        OtpToken otpToken = otpTokenRepository.findByEmailAndOtpAndUsedFalse(email, otp)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_OTP));

        if (LocalDateTime.now().isAfter(otpToken.getExpiryDate())) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }

        otpToken.setUsed(true);
        otpTokenRepository.save(otpToken);
    }

    private String generateOtp() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }
}