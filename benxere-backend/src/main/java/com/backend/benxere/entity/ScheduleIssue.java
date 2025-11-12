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
@Table(name = "schedule_issues")
public class ScheduleIssue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "issue_id")
    int issueId;

    @ManyToOne
    @JoinColumn(name = "schedule_id", referencedColumnName = "schedule_id", foreignKey = @ForeignKey(name = "FK_Issue_Schedule"))
    Schedule schedule;

    @ManyToOne
    @JoinColumn(name = "reported_by", referencedColumnName = "user_id", foreignKey = @ForeignKey(name = "FK_Issue_User"))
    User reportedBy;

    @Column(name = "issue_type", nullable = false)
    String issueType;  // MECHANICAL, TRAFFIC, PASSENGER, ACCIDENT, OTHER

    @Column(name = "issue_description", nullable = false)
    String issueDescription;

    @Column(name = "issue_severity", nullable = false)
    String issueSeverity;  // LOW, MEDIUM, HIGH, CRITICAL

    @Column(name = "issue_status", nullable = false)
    String issueStatus;  // REPORTED, IN_PROGRESS, RESOLVED, CLOSED

    @Column(name = "location_latitude")
    Double locationLatitude;

    @Column(name = "location_longitude")
    Double locationLongitude;

    @Column(name = "location_description")
    String locationDescription;

    @Column(name = "resolution_notes")
    String resolutionNotes;

    @Column(name = "resolved_at")
    LocalDateTime resolvedAt;

    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}