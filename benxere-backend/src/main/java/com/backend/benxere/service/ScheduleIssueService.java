package com.backend.benxere.service;

import com.backend.benxere.dto.request.ScheduleIssueRequest;
import com.backend.benxere.dto.response.ScheduleIssueResponse;
import com.backend.benxere.entity.Schedule;
import com.backend.benxere.entity.ScheduleIssue;
import com.backend.benxere.entity.User;
import com.backend.benxere.exception.AppException;
import com.backend.benxere.exception.ErrorCode;
import com.backend.benxere.repository.ScheduleIssueRepository;
import com.backend.benxere.repository.ScheduleRepository;
import com.backend.benxere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduleIssueService {
    private final ScheduleIssueRepository scheduleIssueRepository;
    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;

    @Transactional
    public ScheduleIssueResponse reportIssue(int scheduleId, ScheduleIssueRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Schedule not found"));
        if ((schedule.getDriver() == null || schedule.getDriver().getUserId() != currentUser.getUserId()) &&
            (schedule.getAssistant() == null || schedule.getAssistant().getUserId() != currentUser.getUserId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED, "Only the driver or assistant of this schedule can report issues");
        }

        ScheduleIssue issue = ScheduleIssue.builder()
                .schedule(schedule)
                .reportedBy(currentUser)
                .issueType(request.getIssueType())
                .issueDescription(request.getIssueDescription())
                .issueSeverity(request.getIssueSeverity())
                .issueStatus("REPORTED")
                .locationLatitude(request.getLocationLatitude())
                .locationLongitude(request.getLocationLongitude())
                .locationDescription(request.getLocationDescription())
                .createdAt(LocalDateTime.now())
                .build();

        ScheduleIssue savedIssue = scheduleIssueRepository.save(issue);
        
        log.info("New issue reported for schedule {}: {} - {}", 
                scheduleId, request.getIssueType(), request.getIssueSeverity());

        return mapToResponse(savedIssue);
    }

    @Transactional
    public ScheduleIssueResponse updateIssueStatus(int issueId, String status) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        ScheduleIssue issue = scheduleIssueRepository.findById(issueId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Issue not found"));

        Schedule schedule = issue.getSchedule();
        if ((schedule.getDriver() == null || schedule.getDriver().getUserId() != currentUser.getUserId()) &&
            (schedule.getAssistant() == null || schedule.getAssistant().getUserId() != currentUser.getUserId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED, "Only the driver or assistant of this schedule can update issue status");
        }

        issue.setIssueStatus(status);
        
        if ("RESOLVED".equals(status)) {
            issue.setResolvedAt(LocalDateTime.now());
        }

        ScheduleIssue updatedIssue = scheduleIssueRepository.save(issue);
        
        log.info("Issue {} status updated to {}", issueId, status);

        return mapToResponse(updatedIssue);
    }

    @Transactional
    public ScheduleIssueResponse addResolutionNotes(int issueId, String notes) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        ScheduleIssue issue = scheduleIssueRepository.findById(issueId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Issue not found"));

        Schedule schedule = issue.getSchedule();
        if ((schedule.getDriver() == null || schedule.getDriver().getUserId() != currentUser.getUserId()) &&
            (schedule.getAssistant() == null || schedule.getAssistant().getUserId() != currentUser.getUserId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED, "Only the driver or assistant of this schedule can add resolution notes");
        }

        issue.setResolutionNotes(notes);

        ScheduleIssue updatedIssue = scheduleIssueRepository.save(issue);

        return mapToResponse(updatedIssue);
    }

    public List<ScheduleIssueResponse> getIssuesBySchedule(int scheduleId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Schedule not found"));
        if ((schedule.getDriver() == null || schedule.getDriver().getUserId() != currentUser.getUserId()) &&
            (schedule.getAssistant() == null || schedule.getAssistant().getUserId() != currentUser.getUserId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED, "Only the driver or assistant of this schedule can view its issues");
        }

        List<ScheduleIssue> issues = scheduleIssueRepository.findByScheduleScheduleId(scheduleId);

        return issues.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<ScheduleIssueResponse> getPublicIssuesBySchedule(int scheduleId) {        scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Schedule not found"));        List<ScheduleIssue> issues = scheduleIssueRepository.findByScheduleScheduleId(scheduleId);
        
        log.info("Returned {} public issues for schedule {}", issues.size(), scheduleId);

        return issues.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ScheduleIssueResponse mapToResponse(ScheduleIssue issue) {
        return ScheduleIssueResponse.builder()
                .issueId(issue.getIssueId())
                .scheduleId(issue.getSchedule().getScheduleId())
                .reportedByUsername(issue.getReportedBy().getEmail())
                .issueType(issue.getIssueType())
                .issueDescription(issue.getIssueDescription())
                .issueSeverity(issue.getIssueSeverity())
                .issueStatus(issue.getIssueStatus())
                .locationLatitude(issue.getLocationLatitude())
                .locationLongitude(issue.getLocationLongitude())
                .locationDescription(issue.getLocationDescription())
                .resolutionNotes(issue.getResolutionNotes())
                .resolvedAt(issue.getResolvedAt())
                .createdAt(issue.getCreatedAt())
                .updatedAt(issue.getUpdatedAt())
                .build();
    }
}