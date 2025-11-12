package com.backend.benxere.dto.response;

import lombok.Data;

@Data
public class LocationResponse {
    private String name;
    private String type;
    private String slug;
    private String nameWithType;
    private String path;
    private String pathWithType;
    private String code;
    private String parentCode;
}

