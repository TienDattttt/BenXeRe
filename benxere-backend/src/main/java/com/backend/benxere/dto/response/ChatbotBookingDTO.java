package com.backend.benxere.dto.response;

import com.backend.benxere.entity.Booking;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotBookingDTO {
    private Integer bookingId;
    private String status;
    private Double totalPrice;
    private LocalDateTime bookingDate;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private String routeName;
    private String companyName;
    private String busNumber;
    private List<String> seatNumbers;
    private String pickUpLocationName;
    private String dropOffLocationName;
    
    public static ChatbotBookingDTO fromBooking(Booking booking) {
        ChatbotBookingDTOBuilder builder = ChatbotBookingDTO.builder()
                .bookingId(booking.getBookingId())
                .status(booking.getStatus().name())
                .totalPrice(booking.getTotalPrice())
                .bookingDate(booking.getBookingDate().toLocalDateTime());
        
        if (booking.getSchedule() != null) {
            builder.departureTime(booking.getSchedule().getDepartureTime())
                   .arrivalTime(booking.getSchedule().getArrivalTime());
            
            if (booking.getSchedule().getRoute() != null) {
                builder.routeName(booking.getSchedule().getRoute().getOrigin() + " - " + 
                                booking.getSchedule().getRoute().getDestination());
            }
            
            if (booking.getSchedule().getBus() != null) {
                builder.companyName(booking.getSchedule().getBus().getCompanyName())
                       .busNumber(booking.getSchedule().getBus().getBusNumber());
            }
        }
        
        if (booking.getSeats() != null && !booking.getSeats().isEmpty()) {
            List<String> seatNumbers = booking.getSeats().stream()
                    .map(seat -> seat.getSeatNumber())
                    .toList();
            builder.seatNumbers(seatNumbers);
        }
        
        if (booking.getPickUpLocation() != null) {
            builder.pickUpLocationName(booking.getPickUpLocation().getName());
        }
        
        if (booking.getDropOffLocation() != null) {
            builder.dropOffLocationName(booking.getDropOffLocation().getName());
        }
        
        return builder.build();
    }
} 