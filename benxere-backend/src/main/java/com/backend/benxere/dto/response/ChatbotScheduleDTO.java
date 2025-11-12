package com.backend.benxere.dto.response;

import com.backend.benxere.entity.Schedule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotScheduleDTO {
    private Integer scheduleId;
    private String routeName;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private Double pricePerSeat;
    private String status;
    private String companyName;
    private String busNumber;
    private String busType;
    private Integer capacity;
    
    public static ChatbotScheduleDTO fromSchedule(Schedule schedule) {
        ChatbotScheduleDTOBuilder builder = ChatbotScheduleDTO.builder()
                .scheduleId(schedule.getScheduleId())
                .departureTime(schedule.getDepartureTime())
                .arrivalTime(schedule.getArrivalTime())
                .pricePerSeat(schedule.getPricePerSeat())
                .status(schedule.getStatus());
        
        if (schedule.getRoute() != null) {
            builder.routeName(schedule.getRoute().getOrigin() + " - " + 
                            schedule.getRoute().getDestination());
        }
        
        if (schedule.getBus() != null) {
            builder.companyName(schedule.getBus().getCompanyName())
                   .busNumber(schedule.getBus().getBusNumber())
                   .busType(schedule.getBus().getBusType().name())
                   .capacity(schedule.getBus().getCapacity());
        }
        
        return builder.build();
    }
} 