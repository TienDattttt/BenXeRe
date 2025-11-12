package com.backend.benxere.controller;

import com.backend.benxere.dto.request.ScheduleRequest;
import com.backend.benxere.dto.response.ScheduleResponse;
import com.backend.benxere.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    @PostMapping("/create")
    public ScheduleResponse createSchedule(@RequestBody ScheduleRequest scheduleRequest) {
        return scheduleService.createSchedule(scheduleRequest);
    }
    @PostMapping("/create-multi")
    public List<ScheduleResponse> createMultipleSchedules(@RequestBody ScheduleRequest scheduleRequest, int numberOfSchedules) {
        return scheduleService.createMultipleSchedules(scheduleRequest,numberOfSchedules);
    }
    @GetMapping("/all")
    public List<ScheduleResponse> getAllSchedules() {
        return scheduleService.getAllSchedules();
    }

    @GetMapping("/{id}")
    public ScheduleResponse getScheduleById(@PathVariable int id) {
        return scheduleService.getScheduleById(id);
    }

    @PutMapping("/{id}")
    public ScheduleResponse updateSchedule(@PathVariable int id, @RequestBody ScheduleRequest scheduleRequest) {
        return scheduleService.updateSchedule(id, scheduleRequest);
    }

    @DeleteMapping("/{id}")
    public void deleteSchedule(@PathVariable int id) {
        scheduleService.deleteSchedule(id);
    }

    @GetMapping("/search")
    public List<ScheduleResponse> getSchedulesByOriginAndDestinationAndDate(@RequestParam String originCode, @RequestParam String destinationCode, @RequestParam String date) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        LocalDate parsedDate = LocalDate.parse(date, formatter);
        return scheduleService.getSchedulesByOriginAndDestinationAndDate(originCode, destinationCode, parsedDate);
    }
    @GetMapping("/bus/{busId}")
    public List<ScheduleResponse> getSchedulesByBusId(@PathVariable int busId) {
        return scheduleService.getSchedulesByBusId(busId);
    }
}