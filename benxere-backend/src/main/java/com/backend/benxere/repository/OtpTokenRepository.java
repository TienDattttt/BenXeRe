package com.backend.benxere.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.benxere.entity.OtpToken;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Integer> {
    Optional<OtpToken> findByEmailAndOtpAndUsedFalse(String email, String otp);
}