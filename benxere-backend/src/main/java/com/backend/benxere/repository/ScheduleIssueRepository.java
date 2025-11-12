package com.backend.benxere.repository;

import com.backend.benxere.entity.ScheduleIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleIssueRepository extends JpaRepository<ScheduleIssue, Integer> {
    List<ScheduleIssue> findByScheduleScheduleId(int scheduleId);
    List<ScheduleIssue> findByReportedByUserId(int userId);
    List<ScheduleIssue> findByIssueStatus(String status);
}