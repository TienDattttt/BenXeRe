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
@Table(name = "attendances")
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attendance_id")
    int attendanceId;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id", foreignKey = @ForeignKey(name = "FK_Attendance_User"))
    User user;

    @ManyToOne
    @JoinColumn(name = "schedule_id", referencedColumnName = "schedule_id", foreignKey = @ForeignKey(name = "FK_Attendance_Schedule"))
    Schedule schedule;

    @Column(name = "check_in_time", nullable = false)
    LocalDateTime checkInTime;

    @Column(name = "check_out_time")
    LocalDateTime checkOutTime;

    @Column(name = "check_in_location")
    String checkInLocation;

    @Column(name = "check_out_location")
    String checkOutLocation;

    @Column(name = "latitude_in")
    Double latitudeIn;

    @Column(name = "longitude_in")
    Double longitudeIn;
    
    @Column(name = "latitude_out")
    Double latitudeOut;

    @Column(name = "longitude_out")
    Double longitudeOut;

    @Column(name = "notes")
    String notes;

    @Column(name = "total_hours")
    Double totalHours;
}