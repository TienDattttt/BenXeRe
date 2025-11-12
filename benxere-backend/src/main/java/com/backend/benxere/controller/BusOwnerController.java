package com.backend.benxere.controller;

import com.backend.benxere.dto.request.ApiResponse;
import com.backend.benxere.dto.response.BusResponse;
import com.backend.benxere.dto.response.RatingResponse;
import com.backend.benxere.dto.response.ScheduleResponse;
import com.backend.benxere.dto.response.UserResponse;
import com.backend.benxere.service.BusService;
import com.backend.benxere.service.RatingService;
import com.backend.benxere.service.ScheduleService;
import com.backend.benxere.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bus-owner")
@RequiredArgsConstructor
public class BusOwnerController {

    private final BusService busService;
    private final ScheduleService scheduleService;
    private final UserService userService;
    private final RatingService ratingService;

    @GetMapping("/buses")
    public List<BusResponse> getBusesByCurrentUser() {
        return busService.getBusByCurrentUser();
    }

    @GetMapping("/schedules")
    public List<ScheduleResponse> getSchedulesByCurrentUser() {
        return scheduleService.getScheduleByCurrentOwner();
    }
    
    @GetMapping("/employees")
    public List<UserResponse> getEmployeesByCurrentUser() {
        return userService.getEmployeesByCurrentUser();
    }
    
    @GetMapping("/reviews")
    public ApiResponse<List<RatingResponse>> getReviewsByCurrentUser() {
        UserResponse currentUser = userService.getMyInfo();
        
        if (currentUser == null) {
            return ApiResponse.<List<RatingResponse>>builder()
                .result(Collections.emptyList())
                .build();
        }
        
        List<RatingResponse> ownerRatings = ratingService.getOwnerRatings(currentUser.getUserId());
        return ApiResponse.<List<RatingResponse>>builder()
            .result(ownerRatings)
            .build();
    }

    @GetMapping("/buses/{busId}/statistics")
    public ApiResponse<Map<String, Object>> getBusStatistics(@PathVariable Integer busId) {
        Map<String, Object> statistics = new HashMap<>();
        
        // Get ratings statistics
        statistics.put("averageRating", ratingService.getAverageRatingByBus(busId));
        statistics.put("totalRatings", ratingService.getRatingCountByBus(busId));
        
        // Get schedules for this bus
        List<ScheduleResponse> schedules = scheduleService.getSchedulesByBusId(busId);
        statistics.put("totalSchedules", schedules.size());
        
        return ApiResponse.<Map<String, Object>>builder()
            .result(statistics)
            .build();
    }

    @GetMapping("/employees/{employeeId}/statistics")
    public ApiResponse<Map<String, Object>> getEmployeeStatistics(@PathVariable Integer employeeId) {
        Map<String, Object> statistics = new HashMap<>();
        
        // Get employee details
        UserResponse employee = userService.getUser(employeeId);
        statistics.put("employeeInfo", employee);
        
        // Get schedules handled by this employee
        List<ScheduleResponse> schedules = scheduleService.getSchedulesByEmployee(employeeId);
        statistics.put("totalSchedules", schedules.size());
        
        // Add schedule breakdown
        statistics.put("schedules", schedules);
        
        return ApiResponse.<Map<String, Object>>builder()
            .result(statistics)
            .build();
    }
}
