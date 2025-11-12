package com.backend.benxere.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    int notificationId;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id", foreignKey = @ForeignKey(name = "FK_Notification_User"))
    User user;

    @Column(name = "title", nullable = false)
    String title;

    @Column(name = "message", nullable = false)
    String message;

    @Column(name = "is_read", nullable = false)
    boolean isRead = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    Timestamp createdAt;
}