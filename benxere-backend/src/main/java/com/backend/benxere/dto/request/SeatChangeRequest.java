package com.backend.benxere.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class SeatChangeRequest {
    private int bookingId;
    private List<Integer> oldSeatIds;
    private List<Integer> newSeatIds;
} 