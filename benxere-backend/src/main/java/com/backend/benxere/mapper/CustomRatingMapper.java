package com.backend.benxere.mapper;

import com.backend.benxere.dto.response.RatingResponse;
import com.backend.benxere.entity.Rating;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CustomRatingMapper {

    @Autowired
    private RatingMapper ratingMapper;

 
    public RatingResponse toResponseWithBusInfo(Rating rating, Integer busId, String busNumber) {
        RatingResponse response = ratingMapper.toResponse(rating);
        return response;
    }
}