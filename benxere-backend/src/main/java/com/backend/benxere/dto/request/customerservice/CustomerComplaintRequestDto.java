package com.backend.benxere.dto.request.customerservice;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerComplaintRequestDto {
    private int customerId;
    private int bookingId;
    private String complaintType;
    private String description;
    private String status;
}