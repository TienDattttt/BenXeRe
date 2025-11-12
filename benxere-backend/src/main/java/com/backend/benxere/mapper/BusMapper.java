package com.backend.benxere.mapper;

import com.backend.benxere.dto.request.BusCreationRequest;
import com.backend.benxere.dto.response.BusImageResponse;
import com.backend.benxere.dto.response.BusResponse;
import com.backend.benxere.entity.Bus;
import com.backend.benxere.entity.BusImage;
import org.mapstruct.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface BusMapper {

    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "busId", ignore = true)
    @Mapping(target = "createdAt", expression = "java(new java.sql.Timestamp(System.currentTimeMillis()))")
    Bus toBus(BusCreationRequest request);
    
    @Mapping(target = "images", expression = "java(convertToImageResponseList(bus.getImages()))")
    @Mapping(target = "owner", source = "owner")
    BusResponse toBusResponse(Bus bus);
    
    default List<BusImage> convertToBusImages(List<MultipartFile> files) {
        if (files == null) return List.of();
        return files.stream()
                .map(file -> {
                    return BusImage.builder()
                            .imageType(file.getContentType())
                            .imageName(file.getOriginalFilename())
                            .imageUrl("/api/bus-images/" + file.getOriginalFilename()) // This will be replaced in service with actual URL
                            .build();
                })
                .collect(Collectors.toList());
    }

    default List<BusImageResponse> convertToImageResponseList(List<BusImage> images) {
        if (images == null) return List.of();
        return images.stream()
                .map(this::convertToBusImageResponse)
                .collect(Collectors.toList());
    }
    
    default BusImageResponse convertToBusImageResponse(BusImage image) {
        if (image == null) return null;
        return BusImageResponse.builder()
                .imageId(image.getImageId())
                .imageName(image.getImageName())
                .imageType(image.getImageType())
                .imageUrl(image.getImageUrl())
                .build();
    }
}