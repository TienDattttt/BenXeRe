package com.backend.benxere.dto.request.customerservice;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerMessageRequestDto {
    private int customerId;
    private int staffId;
    private int bookingId;
    private String message;
    private boolean forwardToBusAssistant;
}