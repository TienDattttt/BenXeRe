package com.backend.benxere.dto.response.customerservice;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerMessageResponseDto {
    private int messageId;
    private int customerId;
    private String customerName;
    private int staffId;
    private String staffName;
    private int bookingId;
    private String message;
    private boolean forwardedToBusAssistant;
    private int busAssistantId;
    private String busAssistantName;
    private LocalDateTime createdAt;
    private String status;
}