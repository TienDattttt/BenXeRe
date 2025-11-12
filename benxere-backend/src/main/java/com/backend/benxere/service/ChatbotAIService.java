package com.backend.benxere.service;

import com.backend.benxere.dto.response.ChatbotResponse;

public interface ChatbotAIService {
    /**
     * Call the external AI API to process the user's text
     * 
     * @param text The input text to analyze
     * @return Chatbot response with intent and entities
     */
    ChatbotResponse predictIntent(String text);
}