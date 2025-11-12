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
public class ChatMessageResponse {
    private Integer id;
    private String content;
    private Integer senderId;
    private String senderEmail;
    private Integer receiverId;
    private String receiverEmail;
    private LocalDateTime sentAt;
    private boolean isRead;
}