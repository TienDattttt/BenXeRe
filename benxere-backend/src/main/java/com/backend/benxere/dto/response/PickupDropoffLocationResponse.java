package com.backend.benxere.dto.response;

import lombok.*;

import java.sql.Timestamp;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PickupDropoffLocationResponse {
    int locationId;
    String name;
    Timestamp createdAt;
    public PickupDropoffLocationResponse(int id, String name) {
        this.locationId = id;
        this.name = name;
    }
}