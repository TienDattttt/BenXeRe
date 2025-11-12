package com.backend.benxere.service.impl;

import com.backend.benxere.dto.response.ChatbotResponse;
import com.backend.benxere.service.ChatbotAIService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class ChatbotAIServiceImpl implements ChatbotAIService {

    private final RestTemplate restTemplate;
    
    @Value("${chatbot.ai.api.url:http://localhost:5000}")
    private String aiApiUrl;
    
    public ChatbotAIServiceImpl(@Qualifier("chatbotRestTemplate") RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public ChatbotResponse predictIntent(String text) {
        log.info("Sending text for intent prediction: {}", text);
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Accept-Charset", "UTF-8");
            
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("text", text);
            
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> aiResponse = restTemplate.postForObject(
                    aiApiUrl + "/predict", 
                    entity, 
                    Map.class
            );
            
            if (aiResponse == null) {
                log.error("Received null response from AI API");
                return ChatbotResponse.builder()
                        .intent("error")
                        .message("Failed to process your request")
                        .build();
            }
            
            log.info("AI API response: {}", aiResponse);
            
            // Debug: Check raw response string for encoding issues
            try {
                String responseJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(aiResponse);
                log.debug("Raw AI response JSON: {}", responseJson);
                byte[] jsonBytes = responseJson.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                String utf8Json = new String(jsonBytes, java.nio.charset.StandardCharsets.UTF_8);
                log.debug("UTF-8 converted JSON: {}", utf8Json);
            } catch (Exception e) {
                log.warn("Could not debug response encoding: {}", e.getMessage());
            }
            
            String intent = (String) aiResponse.get("intent");
            
            // Handle entities - AI returns array of {entity: "B-departure", token: "value"}
            Map<String, String> entities = new HashMap<>();
            Object entitiesObj = aiResponse.get("entities");
            
            if (entitiesObj instanceof java.util.List) {
                @SuppressWarnings("unchecked")
                java.util.List<Map<String, Object>> entitiesList = (java.util.List<Map<String, Object>>) entitiesObj;
                
                log.debug("Raw entities list from AI: {}", entitiesList);
                
                // Convert AI format to BIO format with token index
                for (int i = 0; i < entitiesList.size(); i++) {
                    Map<String, Object> entityObj = entitiesList.get(i);
                    String entityTag = (String) entityObj.get("entity");
                    String token = (String) entityObj.get("token");
                    
                    log.debug("Processing entity {}: tag={}, token='{}'", i, entityTag, token);
                    
                    if (entityTag != null && token != null) {
                        entities.put(String.valueOf(i), entityTag);
                        // Also store the token for reference
                        entities.put("token_" + i, token);
                    }
                }
            } else if (entitiesObj instanceof Map) {
                // Fallback for other formats
                @SuppressWarnings("unchecked")
                Map<String, Object> entitiesMap = (Map<String, Object>) entitiesObj;
                
                for (Map.Entry<String, Object> entry : entitiesMap.entrySet()) {
                    entities.put(entry.getKey(), String.valueOf(entry.getValue()));
                }
            }
            
            log.debug("Parsed entities: {}", entities);
            
            return ChatbotResponse.builder()
                    .intent(intent)
                    .entities(entities)
                    .build();
            
        } catch (Exception e) {
            log.error("Error calling AI API: {}", e.getMessage(), e);
            return ChatbotResponse.builder()
                    .intent("error")
                    .message("An error occurred: " + e.getMessage())
                    .build();
        }
    }
}