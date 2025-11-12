package com.backend.benxere.service;

import com.backend.benxere.dto.request.ChatMessageRequest;
import com.backend.benxere.dto.response.ChatMessageResponse;

import java.util.List;

public interface ChatService {

    void sendMessage(ChatMessageRequest chatMessage, Integer senderId);
    List<ChatMessageResponse> getChatHistory(Integer currentUserId, Integer otherUserId);
    List<ChatMessageResponse> getUnreadMessages(Integer userId);
    void markMessagesAsRead(Integer senderId, Integer receiverId);
    List<com.backend.benxere.dto.response.ConversationSummaryResponse> getConversations(Integer userId);
    List<com.backend.benxere.dto.response.ChatMessageResponse> getChatHistory(Integer userId, Integer partnerId, int page, int size);
}