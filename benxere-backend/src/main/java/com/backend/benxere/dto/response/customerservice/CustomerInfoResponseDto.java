package com.backend.benxere.dto.response.customerservice;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerInfoResponseDto {
    private int customerId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
    private LocalDateTime registrationDate;
    private int totalBookings;
    private int totalComplaints;
}