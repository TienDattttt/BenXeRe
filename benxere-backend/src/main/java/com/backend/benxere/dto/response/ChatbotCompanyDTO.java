package com.backend.benxere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotCompanyDTO {
    private String companyName;
    private Integer busCount;
    private Double averageRating;
    private Long ratingCount;
    private Set<String> busTypes;
} 