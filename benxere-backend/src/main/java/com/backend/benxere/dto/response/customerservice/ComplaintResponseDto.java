package com.backend.benxere.dto.response.customerservice;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintResponseDto {
    private int complaintId;
    private int customerId;
    private String customerName;
    private String customerPhone;
    private int bookingId;
    private String complaintType;
    private String description;
    private String status;
    private String response;
    private int assignedStaffId;
    private String assignedStaffName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}