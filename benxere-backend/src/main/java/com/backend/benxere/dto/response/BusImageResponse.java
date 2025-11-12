package com.backend.benxere.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BusImageResponse {
    private int imageId;
    private String imageName;
    private String imageType;
    private String imageUrl;
}