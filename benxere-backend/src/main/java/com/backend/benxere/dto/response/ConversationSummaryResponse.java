package com.backend.benxere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationSummaryResponse {
    private Integer partnerId;
    private String partnerEmail;
    private long unreadCount;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
}