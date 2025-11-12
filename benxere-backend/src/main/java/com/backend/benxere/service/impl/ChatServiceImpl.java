package com.backend.benxere.service.impl;

import com.backend.benxere.dto.request.ChatMessageRequest;
import com.backend.benxere.dto.response.ChatMessageResponse;
import com.backend.benxere.dto.response.ConversationSummaryResponse;
import com.backend.benxere.entity.ChatMessage;
import com.backend.benxere.entity.User;
import com.backend.benxere.repository.ChatMessageRepository;
import com.backend.benxere.repository.UserRepository;
import com.backend.benxere.service.ChatService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatServiceImpl implements ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public void sendMessage(ChatMessageRequest chatMessage, Integer senderId) {
        log.info("Processing message from sender ID: {}", senderId);
        
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        
        User receiver = userRepository.findById(chatMessage.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        ChatMessage message = ChatMessage.builder()
                .content(chatMessage.getContent())
                .sender(sender)
                .receiver(receiver)
                .isRead(false)
                .build();

        message = chatMessageRepository.save(message);
        
        ChatMessageResponse response = mapToResponse(message);
        
        try {
            String destination = "/user/" + receiver.getEmail() + "/queue/messages";
            log.info("Sending message to destination: {}", destination);
            messagingTemplate.convertAndSendToUser(
                    receiver.getEmail(),
                    "/queue/messages",
                    response
            );
            log.info("Message sent successfully to receiver");
        } catch (Exception e) {
            log.error("Failed to send message via WebSocket: {}", e.getMessage(), e);
        }
    }

    @Override
    public List<ChatMessageResponse> getChatHistory(Integer currentUserId, Integer otherUserId) {
        log.info("Getting chat history between user {} and user {}", currentUserId, otherUserId);
        List<ChatMessage> messages = chatMessageRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(
                currentUserId, otherUserId, currentUserId, otherUserId);
        
        return messages.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ChatMessageResponse> getUnreadMessages(Integer userId) {
        log.info("Getting unread messages for user ID: {}", userId);
        List<ChatMessage> unreadMessages = chatMessageRepository.findByReceiverUserIdAndIsReadFalse(userId);
        return unreadMessages.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markMessagesAsRead(Integer senderId, Integer receiverId) {
        log.info("Marking messages as read from sender {} to receiver {}", senderId, receiverId);
        chatMessageRepository.markMessagesAsRead(senderId, receiverId);
    }

    @Override
    public List<ConversationSummaryResponse> getConversations(Integer userId) {
        List<Integer> senders = chatMessageRepository.findDistinctSenders(userId);
        List<Integer> receivers = chatMessageRepository.findDistinctReceivers(userId);
        Set<Integer> partners = new HashSet<>();
        partners.addAll(senders);
        partners.addAll(receivers);
        partners.remove(userId);

        List<ConversationSummaryResponse> result = new ArrayList<>();
        for (Integer partnerId : partners) {
            User partner = userRepository.findById(partnerId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + partnerId));
            long unread = chatMessageRepository.countUnreadBySenderAndReceiver(partnerId, userId);
            List<ChatMessage> lastList = chatMessageRepository.findMessageHistory(userId, partnerId, PageRequest.of(0, 1));
            String lastMsg = lastList.isEmpty() ? null : lastList.get(0).getContent();
            LocalDateTime lastTime = lastList.isEmpty() ? null : lastList.get(0).getSentAt();

            result.add(ConversationSummaryResponse.builder()
                    .partnerId(partnerId)
                    .partnerEmail(partner.getEmail())
                    .unreadCount(unread)
                    .lastMessage(lastMsg)
                    .lastMessageTime(lastTime)
                    .build());
        }
        return result;
    }

    @Override
    public List<ChatMessageResponse> getChatHistory(Integer userId, Integer partnerId, int page, int size) {
        PageRequest pageReq = PageRequest.of(page, size);
        List<ChatMessage> messages = chatMessageRepository.findMessageHistory(userId, partnerId, pageReq);
        List<ChatMessageResponse> responses = messages.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return responses;
    }
    
    private ChatMessageResponse mapToResponse(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .content(message.getContent())
                .senderId(message.getSender().getUserId())
                .senderEmail(message.getSender().getEmail())
                .receiverId(message.getReceiver().getUserId())
                .receiverEmail(message.getReceiver().getEmail())
                .sentAt(message.getSentAt())
                .isRead(message.isRead())
                .build();
    }
}