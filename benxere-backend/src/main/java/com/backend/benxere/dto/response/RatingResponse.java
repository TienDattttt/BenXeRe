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
public class RatingResponse {
    private Integer id;
    private Integer userId;
    private String userEmail;
    private Integer scheduleId;
    private Integer busId;
    private String companyName;
    private Integer busOwnerId;
    private Integer rating;
    private String comment;
    private String imageUrl;
    private LocalDateTime createdAt;
}