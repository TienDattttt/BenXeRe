package com.backend.benxere.repository;

import com.backend.benxere.entity.LeaveRequest;
import com.backend.benxere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Integer> {
    
    List<LeaveRequest> findByUser(User user);
    
    List<LeaveRequest> findByUserAndStatus(User user, LeaveRequest.LeaveRequestStatus status);
    
    List<LeaveRequest> findByUserOrderByCreatedAtDesc(User user);
    
    List<LeaveRequest> findByStatusOrderByCreatedAtDesc(LeaveRequest.LeaveRequestStatus status);
    
    @Query("SELECT l FROM LeaveRequest l WHERE l.user = :user AND " +
           "((l.startDate <= :endDate AND l.endDate >= :startDate) AND " +
           "(l.status = 'PENDING' OR l.status = 'APPROVED'))")
    List<LeaveRequest> findOverlappingLeaveRequests(User user, LocalDateTime startDate, LocalDateTime endDate);
}