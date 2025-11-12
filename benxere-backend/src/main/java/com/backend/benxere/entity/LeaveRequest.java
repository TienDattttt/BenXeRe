package com.backend.benxere.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "leave_requests")
public class LeaveRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "leave_request_id")
    int leaveRequestId;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id", foreignKey = @ForeignKey(name = "FK_LeaveRequest_User"))
    User user;

    @Column(name = "start_date", nullable = false)
    LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    LocalDateTime endDate;

    @Column(name = "reason", length = 500)
    String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    LeaveRequestStatus status;

    @Column(name = "admin_notes", length = 500)
    String adminNotes;

    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "updated_by", referencedColumnName = "user_id", foreignKey = @ForeignKey(name = "FK_LeaveRequest_UpdatedBy"))
    User updatedBy;

    public enum LeaveRequestStatus {
        PENDING, APPROVED, REJECTED
    }
}