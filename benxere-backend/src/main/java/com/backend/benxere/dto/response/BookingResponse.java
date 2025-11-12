package com.backend.benxere.dto.response;

import com.backend.benxere.entity.Booking.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.sql.Timestamp;
import java.util.List;

@Data
@Builder
public class BookingResponse {
    private int bookingId;
    private int userId;
    private int scheduleId;
    private double originalPrice;
    private double discountAmount;
    private double totalPrice;
    private Integer couponId;
    private String couponCode;
    private Timestamp bookingDate;
    private BookingStatus status;
    private List<Integer> seatIds;
    private int pickUpLocationId;
    private int dropOffLocationId;
    private boolean isRated; 
    private String pickUpLocationName;
    private String dropOffLocationName;
    private List<String> seatNumbers;
    private String routeName;
    private Timestamp departureTime;
    private Timestamp arrivalTime;
    private String busLicensePlate;
    private String companyName;
}