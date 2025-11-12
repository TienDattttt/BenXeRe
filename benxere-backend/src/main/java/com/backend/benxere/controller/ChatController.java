package com.backend.benxere.controller;

import com.backend.benxere.dto.request.ChatMessageRequest;
import com.backend.benxere.dto.response.ChatMessageResponse;
import com.backend.benxere.entity.User;
import com.backend.benxere.repository.UserRepository;
import com.backend.benxere.service.ChatService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;


    @MessageMapping("/chat.send")
    public void sendMessage(
            @Payload ChatMessageRequest chatMessage,
            Principal principal) {
        
        log.info("Received message from {} to user {}", principal.getName(), chatMessage.getReceiverId());
        
        User sender = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));
        
        chatService.sendMessage(chatMessage, sender.getUserId());
    }


    @MessageMapping("/chat.read")
    public void markAsRead(
            @Payload Integer senderId,
            Principal principal) {
        
        log.info("Marking messages as read from {} to {}", senderId, principal.getName());
        
        User receiver = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));
        
        chatService.markMessagesAsRead(senderId, receiver.getUserId());
    }


    @MessageMapping("/chat.connect")
    @SendToUser("/queue/connect")
    public String connectTest(SimpMessageHeaderAccessor headerAccessor, Principal principal) {
        String username = principal != null ? principal.getName() : "anonymous";
        log.info("WebSocket connection test from user: {}", username);
        return "Connected successfully as " + username;
    }

    @GetMapping("/history/all/{otherUserId}")
    public ResponseEntity<List<ChatMessageResponse>> getFullChatHistory(
            Authentication authentication,
            @PathVariable Integer otherUserId) {
        log.info("Getting full chat history with user {}", otherUserId);
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + authentication.getName()));
        List<ChatMessageResponse> chatHistory = chatService.getChatHistory(
                currentUser.getUserId(), otherUserId);
        return ResponseEntity.ok(chatHistory);
    }

  
    @GetMapping("/unread")
    public ResponseEntity<List<ChatMessageResponse>> getUnreadMessages(Authentication authentication) {
        log.info("Getting unread messages");
        
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + authentication.getName()));
        
        List<ChatMessageResponse> unreadMessages = chatService.getUnreadMessages(currentUser.getUserId());
        
        return ResponseEntity.ok(unreadMessages);
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<com.backend.benxere.dto.response.ConversationSummaryResponse>> getConversations(
            Authentication authentication) {
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + authentication.getName()));
        List<com.backend.benxere.dto.response.ConversationSummaryResponse> conversations =
                chatService.getConversations(currentUser.getUserId());
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/history/{partnerId}")
    public ResponseEntity<List<ChatMessageResponse>> getPaginatedHistory(
            Authentication authentication,
            @PathVariable Integer partnerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + authentication.getName()));
        List<ChatMessageResponse> history = chatService.getChatHistory(
                currentUser.getUserId(), partnerId, page, size);
        return ResponseEntity.ok(history);
    }
}