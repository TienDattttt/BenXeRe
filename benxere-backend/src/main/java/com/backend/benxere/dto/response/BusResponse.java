package com.backend.benxere.dto.response;

import com.backend.benxere.entity.Bus;
import lombok.Builder;
import lombok.Data;

import java.sql.Timestamp;
import java.util.List;

@Data
@Builder
public class BusResponse {
    private int busId;
    private String busNumber;
    private Bus.BusType busType;
    private int capacity;
    private String companyName;
    private Timestamp createdAt;
    private List<BusImageResponse> images;
    private UserResponse owner;
}