package com.backend.benxere.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Timestamp;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    int bookingId;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id", foreignKey = @ForeignKey(name = "FK_Booking_User"))
    User user;

    @ManyToOne
    @JoinColumn(name = "schedule_id", referencedColumnName = "schedule_id", foreignKey = @ForeignKey(name = "FK_Booking_Schedule"))
    Schedule schedule;

    @Column(name = "original_price")
    Double originalPrice;

    @Column(name = "discount_amount")
    Double discountAmount;

    @Column(name = "total_price", nullable = false)
    Double totalPrice;

    @ManyToOne
    @JoinColumn(name = "coupon_id", referencedColumnName = "coupon_id", foreignKey = @ForeignKey(name = "FK_Booking_Coupon"))
    Coupon coupon;

    @Column(name = "booking_date", nullable = false, updatable = false)
    Timestamp bookingDate;

    @Column(name = "created_at")
    Timestamp createdAt;

    @Column(name = "is_rated")
    Boolean isRated;

    
    @Column(name = "is_temporary")
    Boolean temporary;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    BookingStatus status;

    @ManyToMany
    @JoinTable(
            name = "booking_seats",
            joinColumns = @JoinColumn(name = "booking_id"),
            inverseJoinColumns = @JoinColumn(name = "seat_id")
    )
    List<Seat> seats;

    @ManyToOne
    @JoinColumn(name = "pick_up_location_id", referencedColumnName = "location_id", foreignKey = @ForeignKey(name = "FK_Booking_PickUpLocation"))
    Location pickUpLocation;

    @ManyToOne
    @JoinColumn(name = "drop_off_location_id", referencedColumnName = "location_id", foreignKey = @ForeignKey(name = "FK_Booking_DropOffLocation"))
    Location dropOffLocation;

     public enum BookingStatus {
        Pending,
        Confirmed,
        Cancelled;
        
        @JsonValue
        public String getValue() {
            return this.name();
        }
        
        @JsonCreator
        public static BookingStatus fromValue(String value) {
            for (BookingStatus status : BookingStatus.values()) {
                if (status.name().equalsIgnoreCase(value)) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Invalid BookingStatus: " + value);
        }
    }
    
}