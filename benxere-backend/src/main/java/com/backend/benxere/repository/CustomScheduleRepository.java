package com.backend.benxere.repository;

import com.backend.benxere.entity.Schedule;

import java.time.LocalDateTime;
import java.util.List;

public interface CustomScheduleRepository {
    List<Schedule> findByRoute_OriginAndRoute_DestinationAndDepartureTimeBetween(String origin, String destination, LocalDateTime startDate, LocalDateTime endDate);
}