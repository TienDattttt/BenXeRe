package com.backend.benxere.controller;

import com.backend.benxere.dto.request.ApiResponse;
import com.backend.benxere.dto.request.BusCreationRequest;
import com.backend.benxere.dto.response.BusResponse;
import com.backend.benxere.service.BusService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/buses")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BusController {
    BusService busService;

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ApiResponse<BusResponse> createBus(
            @RequestPart("busData") @Valid BusCreationRequest busData,
            @RequestPart("images") List<MultipartFile> images
    ) {
        busData.setImages(images);
        BusResponse response = busService.createBus(busData);
        return ApiResponse.<BusResponse>builder().result(response).build();
    }

    @GetMapping("/all")
    public List<BusResponse> getAllBuses() {
        return busService.getAllBuses();
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusResponse> getBusById(@PathVariable int id) {
        BusResponse busResponse = busService.getBusById(id);
        return ResponseEntity.ok(busResponse);
    }    @PutMapping(value = "/{id}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public BusResponse updateBus(
            @PathVariable int id,
            @RequestPart("busData") @Valid BusCreationRequest busData,
            @RequestPart(value = "images", required = false) List<MultipartFile> images 
    ) {
        if (images != null) {
            busData.setImages(images);
        }
        return busService.updateBus(id, busData);
    }

    @DeleteMapping("/{id}")
    public void deleteBus(@PathVariable int id) {
        busService.deleteBus(id);
    }

}