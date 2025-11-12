package com.backend.benxere.controller;

import com.backend.benxere.dto.request.ApiResponse;
import com.backend.benxere.dto.request.RatingRequest;
import com.backend.benxere.dto.response.RatingResponse;
import com.backend.benxere.service.RatingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@Tag(name = "Ratings", description = "Rating management APIs")
@Slf4j
public class RatingController {

    @Autowired
    private RatingService ratingService;

    @GetMapping
    public List<RatingResponse> getAllRatings() {
        return ratingService.getAllRatings();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RatingResponse> getRatingById(@PathVariable int id) {
        RatingResponse ratingResponse = ratingService.getRatingById(id);
        return ratingResponse != null ? ResponseEntity.ok(ratingResponse) : ResponseEntity.notFound().build();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new rating with image")
    public ResponseEntity<RatingResponse> createRating(
            @RequestParam("busId") Integer busId,
            @RequestParam("rating") Integer rating,
            @RequestParam(value = "scheduleId", required = false) Integer scheduleId,
            @RequestParam(value = "comment", required = false) String comment,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        
        log.info("Received rating request: busId={}, rating={}, scheduleId={}, comment={}",
                busId, rating, scheduleId, comment);
        
        RatingRequest ratingRequest = new RatingRequest();
        ratingRequest.setBusId(busId);
        ratingRequest.setRating(rating);
        ratingRequest.setScheduleId(scheduleId);
        ratingRequest.setComment(comment);
        ratingRequest.setImage(image);
        
        RatingResponse ratingResponse = ratingService.createRating(ratingRequest);
        return ResponseEntity.ok(ratingResponse);
    }

    @PostMapping(value = "/json", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create a rating without image")
    public ResponseEntity<RatingResponse> createRatingJson(@RequestBody RatingRequest ratingRequest) {
        log.info("Received JSON rating request: busId={}, rating={}", 
                ratingRequest.getBusId(), ratingRequest.getRating());
        
        RatingResponse ratingResponse = ratingService.createRating(ratingRequest);
        return ResponseEntity.ok(ratingResponse);
    }

    @PutMapping("/{id}")
    public RatingResponse updateRating(@PathVariable int id, @RequestBody RatingRequest ratingRequest) {
        return ratingService.updateRating(id, ratingRequest);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRating(@PathVariable int id) {
        ratingService.deleteRating(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/bus/{busId}")
    public ApiResponse<List<RatingResponse>> getRatingsByBusId(@PathVariable int busId) {
        return ratingService.getRatingsByBusId(busId);
    }
}