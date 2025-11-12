package com.backend.benxere.service;

import com.backend.benxere.dto.request.ChatbotRequest;
import com.backend.benxere.dto.response.ChatbotResponse;

public interface ChatbotService {
  
    ChatbotResponse processRequest(ChatbotRequest request);
}