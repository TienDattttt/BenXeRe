package com.backend.benxere.service;

import com.backend.benxere.dto.request.ApiResponse;
import com.backend.benxere.dto.request.RatingRequest;
import com.backend.benxere.dto.response.RatingResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

public interface RatingService {
    List<RatingResponse> getOwnerRatings(Integer ownerId);
    
    List<RatingResponse> getAllRatings();
    ApiResponse<List<RatingResponse>> getRatingsByScheduleId(int scheduleId);
    ApiResponse<List<RatingResponse>> getRatingsByBusId(int busId);

    List<RatingResponse> getAllRatingsByCompany(String companyName);

    RatingRequest processRatingRequest(boolean isMultipart, RatingRequest jsonRequest, 
                                      RatingRequest formRequest, HttpServletRequest request);
    
    RatingResponse createRating(RatingRequest request);
    RatingResponse updateRating(int ratingId, RatingRequest request);
    void deleteRating(int ratingId);
    RatingResponse getRatingById(int ratingId);
    List<RatingResponse> getRatingsBySchedule(int scheduleId);
    List<RatingResponse> getCurrentUserRatings();

    Page<RatingResponse> getRatingsByCompany(String companyName, Pageable pageable);
    double getAverageRatingByCompany(String companyName);
    long getRatingCountByCompany(String companyName);

    Page<RatingResponse> getRatingsByBus(Integer busId, Pageable pageable);
    double getAverageRatingByBus(Integer busId);
    long getRatingCountByBus(Integer busId);

    Page<RatingResponse> getRatingsByOwner(Integer ownerId, Pageable pageable);
    double getAverageRatingByOwner(Integer ownerId);
    long getRatingCountByOwner(Integer ownerId);
}