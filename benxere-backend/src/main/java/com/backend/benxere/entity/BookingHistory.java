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
@Table(name = "booking_history")
public class BookingHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    int historyId;

    @ManyToOne
    @JoinColumn(name = "booking_id", referencedColumnName = "booking_id", foreignKey = @ForeignKey(name = "FK_BookingHistory_Booking"))
    Booking booking;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    BookingStatus status;

    @Column(name = "updated_at", nullable = false, updatable = false)
    Timestamp updatedAt;

    @ManyToOne
    @JoinColumn(name = "updated_by", referencedColumnName = "user_id", foreignKey = @ForeignKey(name = "FK_BookingHistory_User"))
    User updatedBy;
}

enum BookingStatus {
    PENDING, CONFIRMED, CANCELLED
}