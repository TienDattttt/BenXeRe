package com.backend.benxere.service;

import com.backend.benxere.dto.request.ScheduleRequest;
import com.backend.benxere.dto.response.PickupDropoffLocationResponse;
import com.backend.benxere.dto.response.ScheduleResponse;
import com.backend.benxere.dto.response.ScheduleSearchResponse;
import com.backend.benxere.entity.*;

import java.time.LocalDate;
import java.util.*;

public interface ScheduleService {
    ScheduleResponse createSchedule(ScheduleRequest request);
    List<ScheduleResponse> createMultipleSchedules(ScheduleRequest request, int numSchedules);
    List<ScheduleResponse> getAllSchedules();
    ScheduleResponse getScheduleById(int id);
    Schedule getScheduleEntityById(int id);
    ScheduleResponse updateSchedule(int id, ScheduleRequest scheduleRequest);
    void deleteSchedule(int id);
    List<ScheduleResponse> getSchedulesByOriginAndDestinationAndDate(String origin, String destination, LocalDate date);
    List<ScheduleResponse> getScheduleByCurrentOwner();
    List<ScheduleResponse> getScheduleByCurrentDriver();
    List<ScheduleResponse> getScheduleByCurrentAssistant();
    List<PickupDropoffLocationResponse> getPickUpLocationsByScheduleId(int scheduleId);
    List<PickupDropoffLocationResponse> getDropOffLocationsByScheduleId(int scheduleId);
    List<ScheduleResponse> getSchedulesByBusId(int busId);
    List<ScheduleSearchResponse> searchSchedules(String origin, String destination, String date);
    List<ScheduleResponse> getSchedulesByBusOwner(int busOwnerId);
    List<ScheduleResponse> getSchedulesByEmployee(Integer employeeId);
}