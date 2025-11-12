package com.backend.benxere.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "schedules")
public class Schedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    int scheduleId;

    @ManyToOne
    @JoinColumn(name = "bus_id", referencedColumnName = "bus_id", foreignKey = @ForeignKey(name = "FK_Schedule_Bus"))
    Bus bus;

    @ManyToOne
    @JoinColumn(name = "driver_id")
    private User driver;

    @ManyToOne
    @JoinColumn(name = "second_driver_id")
    private User secondDriver;

    @ManyToOne
    @JoinColumn(name = "assistant_id")
    private User assistant;

    @ManyToOne
    @JoinColumn(name = "route_id", referencedColumnName = "route_id", foreignKey = @ForeignKey(name = "FK_Schedule_Route"))
    Route route;

    @Column(name = "departure_time", nullable = false)
    LocalDateTime departureTime;

    @Column(name = "arrival_time", nullable = false)
    LocalDateTime arrivalTime;

    @Column(name = "price_per_seat", nullable = false)
    double pricePerSeat;
    
    @Column(name = "status", nullable = false)
    String status = "SCHEDULED";  // SCHEDULED, STARTED, FINISHED, CANCELLED
    
    @Column(name = "actual_start_time")
    LocalDateTime actualStartTime;
    
    @Column(name = "actual_end_time")
    LocalDateTime actualEndTime;

    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    List<Seat> seats;
    
    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    List<ScheduleLocation> scheduleLocations;
    
    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    List<ScheduleIssue> issues;

    @Transient
    Set<Location> pickUpLocations;

    @Transient
    Set<Location> dropOffLocations;

    @Column(name = "created_at", nullable = false, updatable = false)
    Timestamp createdAt;
}