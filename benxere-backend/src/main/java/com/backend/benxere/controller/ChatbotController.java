package com.backend.benxere.controller;

import com.backend.benxere.dto.request.ChatbotRequest;
import com.backend.benxere.dto.response.ChatbotResponse;
import com.backend.benxere.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@Slf4j
public class ChatbotController {

    private final ChatbotService chatbotService;
  
    @PostMapping(produces = "application/json; charset=UTF-8")
    public ResponseEntity<ChatbotResponse> processQuery(
            @RequestBody ChatbotRequest request,
            Authentication authentication) {
        
        log.info("Received chatbot query: {}", request.getText());
        
        ChatbotResponse response = chatbotService.processRequest(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping(value = "/query", produces = "application/json; charset=UTF-8")
    public ResponseEntity<ChatbotResponse> processQueryAlias(
            @RequestBody ChatbotRequest request,
            Authentication authentication) {
        
        log.info("Received chatbot query via /query: {}", request.getText());
        
        ChatbotResponse response = chatbotService.processRequest(request);
        return ResponseEntity.ok(response);
    }
    
}