package com.backend.benxere.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "seats")
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "seat_id")
    int seatId;

    @ManyToOne
    @JoinColumn(name = "schedule_id", referencedColumnName = "schedule_id", foreignKey = @ForeignKey(name = "FK_Seat_Schedule"))
    Schedule schedule;

    @Column(name = "seat_number", nullable = false)
    String seatNumber;

    @Column(name = "is_booked", nullable = false)
    boolean isBooked;    @ManyToOne
    @JoinColumn(name = "booked_by", referencedColumnName = "user_id", foreignKey = @ForeignKey(name = "FK_Seat_User"))
    User bookedBy;
    
    @Column(name = "booked_at")
    LocalDateTime bookedAt;
    
    @Column(name = "check_in_time")
    LocalDateTime checkInTime;
    
    @Column(name = "check_out_time")
    LocalDateTime checkOutTime;
    
    @Column(name = "passenger_status", length = 50)
    String passengerStatus;
    
    @Column(name = "driver_notes", length = 500)
    String driverNotes;
    
    @Column(name = "baggage_count")
    Integer baggageCount;
    
    @Column(name = "last_updated_by")
    Integer lastUpdatedBy;
    
    @Column(name = "last_updated_at")
    LocalDateTime lastUpdatedAt;
    
    @Column(name = "qr_code_data", columnDefinition = "TEXT")
    String qrCodeData;
    
    @Column(name = "qr_code_scanned_count")
    Integer qrCodeScannedCount = 0;
    
    @Column(name = "last_qr_scan_time")
    LocalDateTime lastQrScanTime;
}