package com.backend.benxere.service.impl;

import com.backend.benxere.dto.request.ScheduleRequest;
import com.backend.benxere.dto.response.ScheduleResponse;
import com.backend.benxere.dto.response.BusResponse;
import com.backend.benxere.dto.response.PickupDropoffLocationResponse;
import com.backend.benxere.dto.response.ScheduleSearchResponse;
import com.backend.benxere.entity.Bus;
import com.backend.benxere.entity.Schedule;
import com.backend.benxere.entity.Seat;
import com.backend.benxere.entity.User;
import com.backend.benxere.entity.Route;
import com.backend.benxere.entity.Location;
import com.backend.benxere.entity.ScheduleLocation;
import com.backend.benxere.exception.AppException;
import com.backend.benxere.exception.ErrorCode;
import com.backend.benxere.repository.ScheduleRepository;
import com.backend.benxere.repository.BusRepository;
import com.backend.benxere.repository.UserRepository;
import com.backend.benxere.repository.RouteRepository;
import com.backend.benxere.repository.SeatRepository;
import com.backend.benxere.repository.LocationRepository;
import com.backend.benxere.repository.ScheduleLocationRepository;
import com.backend.benxere.repository.CustomScheduleRepositoryImpl;
import com.backend.benxere.service.ScheduleService;
import com.backend.benxere.service.BusService;
import com.backend.benxere.mapper.ScheduleMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.Set;
import java.util.Collections;
import java.sql.Timestamp;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.InputStream;

@Service
public class ScheduleServiceImpl implements ScheduleService {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private ScheduleLocationRepository scheduleLocationRepository;

    @Autowired
    private ScheduleMapper scheduleMapper;

    @Autowired
    private BusService busService;

    @Autowired
    private CustomScheduleRepositoryImpl customScheduleRepositoryImpl;

    private void validateScheduleConflicts(Schedule schedule, ScheduleRequest scheduleRequest) {
        LocalDateTime departureTime = scheduleRequest.getDepartureTime();
        LocalDateTime arrivalTime = scheduleRequest.getArrivalTime();

        // Check bus conflicts
        List<Schedule> busSchedules = scheduleRepository.findByBus_BusId(scheduleRequest.getBusId());
        for (Schedule existingSchedule : busSchedules) {
            if (existingSchedule.getScheduleId() != schedule.getScheduleId() && // Skip current schedule when updating
                hasTimeOverlap(existingSchedule.getDepartureTime(), existingSchedule.getArrivalTime(), 
                             departureTime, arrivalTime)) {
                throw new AppException(ErrorCode.BAD_REQUEST, 
                    "Bus is already scheduled for another route during this time period");
            }
        }

        // Check driver conflicts
        if (scheduleRequest.getDriverId() > 0) {
            User driver = userRepository.findById(scheduleRequest.getDriverId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

            List<Schedule> driverSchedules = scheduleRepository.findAllByDriver(driver);
            for (Schedule existingSchedule : driverSchedules) {
                if (existingSchedule.getScheduleId() != schedule.getScheduleId() && // Skip current schedule when updating
                    hasTimeOverlap(existingSchedule.getDepartureTime(), existingSchedule.getArrivalTime(), 
                                 departureTime, arrivalTime)) {
                    String driverName = driver.getFirstName() + " " + driver.getLastName();
                    throw new AppException(ErrorCode.BAD_REQUEST, 
                        "Driver " + driverName + " is already assigned to another schedule during this time period");
                }
            }

            // Check if driver is assigned as second driver in another schedule
            List<Schedule> secondDriverSchedules = scheduleRepository.findAllBySecondDriver(driver);
            for (Schedule existingSchedule : secondDriverSchedules) {
                if (existingSchedule.getScheduleId() != schedule.getScheduleId() && // Skip current schedule when updating
                    hasTimeOverlap(existingSchedule.getDepartureTime(), existingSchedule.getArrivalTime(), 
                                 departureTime, arrivalTime)) {
                    String driverName = driver.getFirstName() + " " + driver.getLastName();
                    throw new AppException(ErrorCode.BAD_REQUEST, 
                        "Driver " + driverName + " is already assigned as second driver in another schedule during this time period");
                }
            }
        }

        // Check second driver conflicts
        if (scheduleRequest.getSecondDriverId() > 0) {
            User secondDriver = userRepository.findById(scheduleRequest.getSecondDriverId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

            // Check if second driver is assigned as second driver in another schedule
            List<Schedule> secondDriverSchedules = scheduleRepository.findAllBySecondDriver(secondDriver);
            for (Schedule existingSchedule : secondDriverSchedules) {
                if (existingSchedule.getScheduleId() != schedule.getScheduleId() && // Skip current schedule when updating
                    hasTimeOverlap(existingSchedule.getDepartureTime(), existingSchedule.getArrivalTime(), 
                                 departureTime, arrivalTime)) {
                    String secondDriverName = secondDriver.getFirstName() + " " + secondDriver.getLastName();
                    throw new AppException(ErrorCode.BAD_REQUEST, 
                        "Second driver " + secondDriverName + " is already assigned to another schedule during this time period");
                }
            }

            // Check if second driver is assigned as driver in another schedule
            List<Schedule> driverSchedules = scheduleRepository.findAllByDriver(secondDriver);
            for (Schedule existingSchedule : driverSchedules) {
                if (existingSchedule.getScheduleId() != schedule.getScheduleId() && // Skip current schedule when updating
                    hasTimeOverlap(existingSchedule.getDepartureTime(), existingSchedule.getArrivalTime(), 
                                 departureTime, arrivalTime)) {
                    String secondDriverName = secondDriver.getFirstName() + " " + secondDriver.getLastName();
                    throw new AppException(ErrorCode.BAD_REQUEST, 
                        "Second driver " + secondDriverName + " is already assigned as driver in another schedule during this time period");
                }
            }
        }

        // Check assistant conflicts
        if (scheduleRequest.getAssistantId() > 0) {
            User assistant = userRepository.findById(scheduleRequest.getAssistantId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

            List<Schedule> assistantSchedules = scheduleRepository.findAllByAssistant(assistant);
            for (Schedule existingSchedule : assistantSchedules) {
                if (existingSchedule.getScheduleId() != schedule.getScheduleId() && // Skip current schedule when updating
                    hasTimeOverlap(existingSchedule.getDepartureTime(), existingSchedule.getArrivalTime(), 
                                 departureTime, arrivalTime)) {
                    String assistantName = assistant.getFirstName() + " " + assistant.getLastName();
                    throw new AppException(ErrorCode.BAD_REQUEST, 
                        "Assistant " + assistantName + " is already assigned to another schedule during this time period");
                }
            }
        }
    }

    private boolean hasTimeOverlap(LocalDateTime start1, LocalDateTime end1, 
                                 LocalDateTime start2, LocalDateTime end2) {
        return (start1.isBefore(end2) && end1.isAfter(start2));
    }

    private void saveLocationDetails(Schedule schedule, List<Integer> pickupLocationIds, List<Integer> dropoffLocationIds) {
        Timestamp now = new Timestamp(System.currentTimeMillis());

        scheduleLocationRepository.deleteByScheduleScheduleId(schedule.getScheduleId());

        List<ScheduleLocation> scheduleLocations = new ArrayList<>();

        if (pickupLocationIds != null && !pickupLocationIds.isEmpty()) {
            for (Integer locationId : pickupLocationIds) {
                Location location = locationRepository.findById(locationId)
                        .orElseThrow(() -> new AppException(ErrorCode.LOCATION_NOT_FOUND));

                ScheduleLocation scheduleLocation = ScheduleLocation.builder()
                        .schedule(schedule)
                        .location(location)
                        .detail("pickup")
                        .createdAt(now)
                        .build();

                scheduleLocations.add(scheduleLocation);
            }
        }

        if (dropoffLocationIds != null && !dropoffLocationIds.isEmpty()) {
            for (Integer locationId : dropoffLocationIds) {
                Location location = locationRepository.findById(locationId)
                        .orElseThrow(() -> new AppException(ErrorCode.LOCATION_NOT_FOUND));

                ScheduleLocation scheduleLocation = ScheduleLocation.builder()
                        .schedule(schedule)
                        .location(location)
                        .detail("dropoff")
                        .createdAt(now)
                        .build();

                scheduleLocations.add(scheduleLocation);
            }
        }

        scheduleLocationRepository.saveAll(scheduleLocations);
    }

    private void loadLocationsForSchedule(Schedule schedule) {
        List<ScheduleLocation> pickupLocations = scheduleLocationRepository
                .findByScheduleIdAndDetail(schedule.getScheduleId(), "pickup");
        List<ScheduleLocation> dropoffLocations = scheduleLocationRepository
                .findByScheduleIdAndDetail(schedule.getScheduleId(), "dropoff");

        Set<Location> pickupSet = pickupLocations.stream()
                .map(ScheduleLocation::getLocation)
                .collect(Collectors.toSet());

        Set<Location> dropoffSet = dropoffLocations.stream()
                .map(ScheduleLocation::getLocation)
                .collect(Collectors.toSet());

        schedule.setPickUpLocations(pickupSet);
        schedule.setDropOffLocations(dropoffSet);
    }

    @Override
    @Transactional
    public ScheduleResponse createSchedule(ScheduleRequest request) {
        Bus bus = busRepository.findById(request.getBusId())
                .orElseThrow(() -> new AppException(ErrorCode.BUS_NOT_FOUND));
        Route route = routeRepository.findById(request.getRouteId())
                .orElseThrow(() -> new AppException(ErrorCode.ROUTE_NOT_FOUND));

        Schedule schedule = new Schedule();
        schedule.setBus(bus);
        schedule.setRoute(route);
        schedule.setDepartureTime(request.getDepartureTime());
        schedule.setArrivalTime(request.getArrivalTime());
        schedule.setPricePerSeat(request.getPricePerSeat());
        schedule.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        if (request.getDriverId() > 0) {
            User driver = userRepository.findById(request.getDriverId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            schedule.setDriver(driver);
        }

        if (request.getSecondDriverId() > 0) {
            User secondDriver = userRepository.findById(request.getSecondDriverId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            schedule.setSecondDriver(secondDriver);
        }

        if (request.getAssistantId() > 0) {
            User assistant = userRepository.findById(request.getAssistantId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            schedule.setAssistant(assistant);
        }

        validateScheduleConflicts(schedule, request);

        schedule = scheduleRepository.save(schedule);

        List<Seat> seats = new ArrayList<>();
        for (int i = 1; i <= bus.getCapacity(); i++) {
            Seat seat = new Seat();
            seat.setSeatNumber(String.valueOf(i));
            seat.setSchedule(schedule);
            seat.setBooked(false);
            seats.add(seat);
        }
        schedule.setSeats(seats);
        seatRepository.saveAll(seats);

        saveLocationDetails(schedule, request.getPickUpLocationIds(), request.getDropOffLocationIds());

        loadLocationsForSchedule(schedule);

        return scheduleMapper.toResponse(schedule);
    }

    @Override
    public List<ScheduleResponse> createMultipleSchedules(ScheduleRequest request, int numSchedules) {
        List<ScheduleResponse> schedules = new ArrayList<>();
        for (int i = 0; i < numSchedules; i++) {
            request.setDepartureTime(request.getDepartureTime().plusDays(1));
            request.setArrivalTime(request.getArrivalTime().plusDays(1));
            schedules.add(createSchedule(request));
        }
        return schedules;
    }    @Override
    public List<ScheduleResponse> getAllSchedules() {
        List<Schedule> schedules = scheduleRepository.findAll();
        schedules.forEach(this::loadLocationsForSchedule);
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }    @Override
    public ScheduleResponse getScheduleById(int id) {
        Optional<Schedule> scheduleOpt = scheduleRepository.findById(id);
        if (scheduleOpt.isPresent()) {
            Schedule schedule = scheduleOpt.get();
            loadLocationsForSchedule(schedule);
            return scheduleMapper.toResponse(schedule);
        }
        return null;
    }

    @Override
    @Transactional
    public ScheduleResponse updateSchedule(int id, ScheduleRequest scheduleRequest) {
        Schedule existingSchedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND, "Schedule not found with id: " + id));
            
        validateScheduleConflicts(existingSchedule, scheduleRequest);
        
        existingSchedule.setDepartureTime(scheduleRequest.getDepartureTime());
        existingSchedule.setArrivalTime(scheduleRequest.getArrivalTime());
        existingSchedule.setPricePerSeat(scheduleRequest.getPricePerSeat());

        if (scheduleRequest.getDriverId() > 0) {
            existingSchedule.setDriver(userRepository.findById(scheduleRequest.getDriverId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));
        }

        if (scheduleRequest.getSecondDriverId() > 0) {
            existingSchedule.setSecondDriver(userRepository.findById(scheduleRequest.getSecondDriverId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));
        }

        if (scheduleRequest.getAssistantId() > 0) {
            existingSchedule.setAssistant(userRepository.findById(scheduleRequest.getAssistantId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));
        }

        Route route = routeRepository.findById(scheduleRequest.getRouteId())
                .orElseThrow(() -> new AppException(ErrorCode.ROUTE_NOT_FOUND));
        existingSchedule.setRoute(route);

        saveLocationDetails(existingSchedule, scheduleRequest.getPickUpLocationIds(),
                scheduleRequest.getDropOffLocationIds());

        scheduleRepository.save(existingSchedule);

        loadLocationsForSchedule(existingSchedule);

        return scheduleMapper.toResponse(existingSchedule);
    }

    @Override
    public void deleteSchedule(int id) {
        scheduleRepository.deleteById(id);
    }    @Override
    public List<ScheduleResponse> getSchedulesByOriginAndDestinationAndDate(String origin, String destination, LocalDate date) {
        List<Schedule> schedules = customScheduleRepositoryImpl.findByRoute_OriginAndRoute_DestinationAndDepartureTimeBetween(
                origin, destination, date.atStartOfDay(), date.plusDays(1).atStartOfDay());
        schedules.forEach(this::loadLocationsForSchedule);
        return schedules.stream().map(scheduleMapper::toResponse).collect(Collectors.toList());
    }    @Override
    public List<ScheduleResponse> getScheduleByCurrentOwner() {
        List<BusResponse> buses = busService.getBusByCurrentUser();
        List<ScheduleResponse> schedules = new ArrayList<>();
        for (BusResponse bus : buses) {
            List<Schedule> busSchedules = scheduleRepository.findByBus_BusId(bus.getBusId());
            busSchedules.forEach(this::loadLocationsForSchedule);
            schedules.addAll(busSchedules.stream().map(scheduleMapper::toResponse).collect(Collectors.toList()));
        }
        return schedules;
    }    @Override
    public List<ScheduleResponse> getScheduleByCurrentDriver() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User driver = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<Schedule> schedules = new ArrayList<>();
        schedules.addAll(scheduleRepository.findAllByDriver(driver));
        schedules.addAll(scheduleRepository.findAllBySecondDriver(driver));
        
        schedules.forEach(this::loadLocationsForSchedule);
        
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }    @Override
    public List<ScheduleResponse> getScheduleByCurrentAssistant() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User assistant = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<Schedule> schedules = scheduleRepository.findAllByAssistant(assistant);
        schedules.forEach(this::loadLocationsForSchedule);
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }    @Override
    public List<PickupDropoffLocationResponse> getPickUpLocationsByScheduleId(int scheduleId) {
        List<ScheduleLocation> pickupLocations = scheduleLocationRepository
                .findByScheduleIdAndDetail(scheduleId, "pickup");

        return pickupLocations.stream()
                .map(sl -> new PickupDropoffLocationResponse(
                        sl.getLocation().getLocationId(),
                        sl.getLocation().getName(),
                        sl.getLocation().getCreatedAt()))
                .collect(Collectors.toList());
    }

    @Override
    public List<PickupDropoffLocationResponse> getDropOffLocationsByScheduleId(int scheduleId) {
        List<ScheduleLocation> dropoffLocations = scheduleLocationRepository
                .findByScheduleIdAndDetail(scheduleId, "dropoff");

        return dropoffLocations.stream()
                .map(sl -> new PickupDropoffLocationResponse(
                        sl.getLocation().getLocationId(),
                        sl.getLocation().getName(),
                        sl.getLocation().getCreatedAt()))
                .collect(Collectors.toList());
    }    @Override
    public List<ScheduleResponse> getSchedulesByBusId(int busId) {
        List<Schedule> schedules = scheduleRepository.findByBus_BusId(busId);
        schedules.forEach(this::loadLocationsForSchedule);
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }    
    public List<ScheduleSearchResponse> searchSchedules(String originCode, String destinationCode, String dateStr) {
        try {
            LocalDate date;
            // Try parsing as ISO format first (yyyy-MM-dd)
            try {
                date = LocalDate.parse(dateStr);
            } catch (DateTimeParseException e) {
                // If that fails, try parsing as dd/MM/yyyy format
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                date = LocalDate.parse(dateStr, formatter);
            }
            
            List<ScheduleResponse> schedules = getSchedulesByOriginAndDestinationAndDate(
                    originCode, destinationCode, date);
            
            return schedules.stream()
                    .map(this::mapToSearchResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error searching schedules: " + e.getMessage());
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
    
   
    private String getLocationCodeByName(String locationName) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            InputStream inputStream = getClass().getResourceAsStream("/tinh_tp.json");
            
            if (inputStream == null) {
                System.err.println("Could not load tinh_tp.json");
                return null;
            }
            
            JsonNode provinces = mapper.readTree(inputStream);
            
            String normalizedName = normalizeString(locationName);
            
            for (JsonNode province : provinces) {
                String name = province.get("name").asText();
                if (normalizeString(name).contains(normalizedName) || 
                    normalizedName.contains(normalizeString(name))) {
                    return province.get("code").asText();
                }
            }
            
            return null;
        } catch (IOException e) {
            System.err.println("Error reading province data: " + e.getMessage());
            return null;
        }
    }
    
  
    private String normalizeString(String input) {
        if (input == null) return "";
        return input.toLowerCase().trim()
                .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
                .replaceAll("[èéẹẻẽêềếệểễ]", "e")
                .replaceAll("[ìíịỉĩ]", "i")
                .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
                .replaceAll("[ùúụủũưừứựửữ]", "u")
                .replaceAll("[ỳýỵỷỹ]", "y")
                .replaceAll("[đ]", "d");
    }
    
  
    private ScheduleSearchResponse mapToSearchResponse(ScheduleResponse scheduleResponse) {
        return ScheduleSearchResponse.builder()
                .scheduleId(scheduleResponse.getScheduleId())
                .busName(scheduleResponse.getBus().getBusNumber())
                .driverName(scheduleResponse.getDriver() != null ? 
                        scheduleResponse.getDriver().getFirstName() + " " + scheduleResponse.getDriver().getLastName() : "Chưa phân công")
                .secondDriverName(scheduleResponse.getSecondDriver() != null ? 
                        scheduleResponse.getSecondDriver().getFirstName() + " " + scheduleResponse.getSecondDriver().getLastName() : "Chưa phân công")
                .assistantName(scheduleResponse.getAssistant() != null ? 
                        scheduleResponse.getAssistant().getFirstName() + " " + scheduleResponse.getAssistant().getLastName() : "Chưa phân công")
                .origin(scheduleResponse.getRoute().getOrigin())
                .destination(scheduleResponse.getRoute().getDestination())
                .departureTime(scheduleResponse.getDepartureTime())
                .arrivalTime(scheduleResponse.getArrivalTime())
                .pricePerSeat(scheduleResponse.getPricePerSeat())
                .availableSeats((int) scheduleResponse.getSeats().stream()
                        .filter(seat -> !seat.isBooked()).count())
                .totalSeats(scheduleResponse.getSeats().size())
                .build();
    }

    @Override
    public Schedule getScheduleEntityById(int id) {
        return scheduleRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Schedule not found"));
    }    @Override
    public List<ScheduleResponse> getSchedulesByBusOwner(int busOwnerId) {
        List<Schedule> schedules = scheduleRepository.findAll().stream()
            .filter(schedule -> schedule.getBus().getOwner().getUserId() == busOwnerId)
            .collect(Collectors.toList());
        // Load locations for each schedule
        schedules.forEach(this::loadLocationsForSchedule);
        return schedules.stream()
            .map(scheduleMapper::toResponse)
            .collect(Collectors.toList());
    }    @Override
    public List<ScheduleResponse> getSchedulesByEmployee(Integer employeeId) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        List<Schedule> schedules = new ArrayList<>();
        schedules.addAll(scheduleRepository.findAllByDriver(employee));
        schedules.addAll(scheduleRepository.findAllBySecondDriver(employee));
        schedules.addAll(scheduleRepository.findAllByAssistant(employee));
        
        // Load locations for each schedule
        schedules.forEach(this::loadLocationsForSchedule);
        
        return schedules.stream()
                .distinct()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }
} 