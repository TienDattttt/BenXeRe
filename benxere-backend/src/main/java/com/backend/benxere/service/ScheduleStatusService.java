package com.backend.benxere.service;

import com.backend.benxere.dto.request.ScheduleStatusRequest;
import com.backend.benxere.entity.Schedule;
import com.backend.benxere.entity.User;
import com.backend.benxere.exception.AppException;
import com.backend.benxere.exception.ErrorCode;
import com.backend.benxere.repository.ScheduleRepository;
import com.backend.benxere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduleStatusService {
    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    
    private static final List<String> VALID_STATUSES = Arrays.asList("SCHEDULED", "STARTED", "FINISHED", "CANCELLED");

    @Transactional
    public Schedule updateScheduleStatus(int scheduleId, ScheduleStatusRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Schedule not found"));

        if ((schedule.getDriver() == null || schedule.getDriver().getUserId() != currentUser.getUserId()) &&
            (schedule.getAssistant() == null || schedule.getAssistant().getUserId() != currentUser.getUserId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED, "Only the driver or assistant of this schedule can update its status");
        }
        
        if (!VALID_STATUSES.contains(request.getStatus())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Invalid status. Must be one of: " + String.join(", ", VALID_STATUSES));
        }
        
        validateStatusTransition(schedule.getStatus(), request.getStatus());
        
        String oldStatus = schedule.getStatus();
        schedule.setStatus(request.getStatus());
        
        if ("STARTED".equals(request.getStatus())) {
            schedule.setActualStartTime(LocalDateTime.now());
        } else if ("FINISHED".equals(request.getStatus())) {
            schedule.setActualEndTime(LocalDateTime.now());
        }
        
        Schedule updatedSchedule = scheduleRepository.save(schedule);
        
        log.info("Schedule {} status changed from {} to {}", scheduleId, oldStatus, request.getStatus());
        
        return updatedSchedule;
    }
    
    public Schedule getScheduleById(int scheduleId) {
        return scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Schedule not found"));
    }
    
    private void validateStatusTransition(String currentStatus, String newStatus) {
        if (currentStatus == null) {
            if ("STARTED".equals(newStatus)) {
                return;
            } else {
                throw new AppException(ErrorCode.BAD_REQUEST, 
                        "Invalid status transition. A schedule with no status can only be changed to STARTED");
            }
        }
        
        if (currentStatus.equals(newStatus)) {
            return; 
        }
        
        switch (currentStatus) {
            case "SCHEDULED":
                if (!"STARTED".equals(newStatus) && !"CANCELLED".equals(newStatus)) {
                    throw new AppException(ErrorCode.BAD_REQUEST, 
                            "Invalid status transition. A SCHEDULED schedule can only be changed to STARTED or CANCELLED");
                }
                break;
            case "STARTED":
                if (!"FINISHED".equals(newStatus) && !"CANCELLED".equals(newStatus)) {
                    throw new AppException(ErrorCode.BAD_REQUEST, 
                            "Invalid status transition. A STARTED schedule can only be changed to FINISHED or CANCELLED");
                }
                break;
            case "FINISHED":
            case "CANCELLED":
                throw new AppException(ErrorCode.BAD_REQUEST, 
                        "Cannot change status. Schedule is already " + currentStatus);
            default:
                throw new AppException(ErrorCode.BAD_REQUEST, "Unknown current status: " + currentStatus);
        }
    }
}