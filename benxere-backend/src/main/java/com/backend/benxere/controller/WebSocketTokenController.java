package com.backend.benxere.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/websocket")
@RequiredArgsConstructor
@Slf4j
public class WebSocketTokenController {

    @GetMapping("/validate")
    public ResponseEntity<String> validateToken(Authentication authentication) {
        String email = authentication.getName();
        log.info("WebSocket token validation requested for user: {}", email);
        return ResponseEntity.ok("Token valid for user: " + email);
    }
}