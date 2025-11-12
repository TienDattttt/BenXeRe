package com.backend.benxere.dto.request;

import com.backend.benxere.entity.Bus.BusType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BusCreationRequest {
    String busNumber;
    BusType busType;
    int capacity;
    String companyName;
    List<MultipartFile> images;

    public BusType getBusType() {
        return busType;
    }
}