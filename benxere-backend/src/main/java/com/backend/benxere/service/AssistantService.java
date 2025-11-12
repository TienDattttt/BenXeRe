package com.backend.benxere.service;

import com.backend.benxere.dto.request.PassengerVerificationRequest;
import com.backend.benxere.dto.response.DriverScheduleResponse;
import com.backend.benxere.dto.response.LocationStopResponse;
import com.backend.benxere.dto.response.PassengerInfoResponse;
import com.backend.benxere.entity.*;
import com.backend.benxere.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AssistantService {

    private final UserRepository userRepository;
    private final ScheduleRepository scheduleRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final LocationRepository locationRepository;

    @Autowired
    public AssistantService(
            UserRepository userRepository,
            ScheduleRepository scheduleRepository,
            SeatRepository seatRepository,
            BookingRepository bookingRepository,
            LocationRepository locationRepository) {
        this.userRepository = userRepository;
        this.scheduleRepository = scheduleRepository;
        this.seatRepository = seatRepository;
        this.bookingRepository = bookingRepository;
        this.locationRepository = locationRepository;
    }


    public List<DriverScheduleResponse> getAssistantSchedules(int assistantId) {
        User assistant = userRepository.findById(assistantId)
                .orElseThrow(() -> new RuntimeException("Assistant not found"));

        List<Schedule> schedules = scheduleRepository.findAllByAssistant(assistant);
        return schedules.stream()
                .map(this::convertToDriverScheduleResponse)
                .collect(Collectors.toList());
    }


    public List<DriverScheduleResponse> getTodayAndUpcomingSchedules(int assistantId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

        List<Schedule> schedules = scheduleRepository
                .findTodayAndUpcomingSchedulesForAssistant(assistantId, now, endOfDay);

        return schedules.stream()
                .map(this::convertToDriverScheduleResponse)
                .collect(Collectors.toList());
    }

    public DriverScheduleResponse getScheduleDetails(int scheduleId, int assistantId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        
        if (schedule.getAssistant() == null || schedule.getAssistant().getUserId() != assistantId) {
            throw new RuntimeException("Assistant is not assigned to this schedule");
        }
        
        return convertToDriverScheduleResponseWithPassengers(schedule);
    }

    @Transactional
    public PassengerInfoResponse updatePassengerStatus(int assistantId, PassengerVerificationRequest request) {
        User assistant = userRepository.findById(assistantId)
                .orElseThrow(() -> new RuntimeException("Assistant not found"));

        Seat seat = seatRepository.findById(request.getSeatId())
                .orElseThrow(() -> new RuntimeException("Seat not found"));

        Schedule schedule = seat.getSchedule();
        if (schedule.getAssistant() == null || schedule.getAssistant().getUserId() != assistantId) {
            throw new RuntimeException("Assistant is not assigned to this schedule");
        }

        if (!seat.isBooked()) {
            throw new RuntimeException("Seat is not booked");
        }

        LocalDateTime now = LocalDateTime.now();

        if (Boolean.TRUE.equals(request.getIsBoarded())) {
            seat.setCheckInTime(now);
            seat.setPassengerStatus("BOARDED");
            if (request.getLuggageCount() != null) seat.setBaggageCount(request.getLuggageCount());
            // Có thể log verificationMethod vào ghi chú nếu muốn:
            if (request.getVerificationMethod() != null) {
                String note = seat.getDriverNotes() == null ? "" : seat.getDriverNotes() + " | ";
                seat.setDriverNotes(note + "Verification: " + request.getVerificationMethod());
            }
            seat.setLastUpdatedBy(assistant.getUserId());
            seat.setLastUpdatedAt(now);
        }

        if (Boolean.TRUE.equals(request.getIsDisembarked())) {
            seat.setCheckOutTime(now);
            seat.setPassengerStatus("DISEMBARKED");
            seat.setLastUpdatedBy(assistant.getUserId());
            seat.setLastUpdatedAt(now);
        }

        if (request.getLuggageCount() != null) {
            seat.setBaggageCount(request.getLuggageCount());
        }

        seatRepository.save(seat);
        return convertToPassengerInfoResponse(seat);
    }



    public List<PassengerInfoResponse> getSchedulePassengers(int scheduleId, int assistantId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        if (schedule.getAssistant() == null || schedule.getAssistant().getUserId() != assistantId) {
            throw new RuntimeException("Assistant is not assigned to this schedule");
        }

        List<Booking> bookings = bookingRepository.findByScheduleAndStatus(
                schedule, Booking.BookingStatus.Confirmed);

        List<PassengerInfoResponse> passengers = new ArrayList<>();
        for (Booking booking : bookings) {
            for (Seat seat : booking.getSeats()) {
                passengers.add(convertToPassengerInfoResponse(seat));
            }
        }
        return passengers;
    }



    private DriverScheduleResponse convertToDriverScheduleResponse(Schedule schedule) {
        int bookedSeatsCount = (int) schedule.getSeats().stream()
                .filter(Seat::isBooked)
                .count();

        if (schedule.getRoute() == null) throw new RuntimeException("Schedule has no route assigned");
        if (schedule.getBus() == null) throw new RuntimeException("Schedule has no bus assigned");

        return DriverScheduleResponse.builder()
                .scheduleId(schedule.getScheduleId())
                .routeName(schedule.getRoute().getOrigin() + " - " + schedule.getRoute().getDestination())
                .busNumber(schedule.getBus().getBusNumber())
                .busLicensePlate(null) // Bus hiện không có license plate
                .busCapacity(schedule.getBus().getCapacity())
                .departureTime(schedule.getDepartureTime())
                .arrivalTime(schedule.getArrivalTime())
                .startLocationName("Unknown") // Route hiện không có startLocation
                .endLocationName("Unknown")   // Route hiện không có endLocation
                .pricePerSeat(schedule.getPricePerSeat())
                .bookedSeatsCount(bookedSeatsCount)
                .totalSeatsCount(schedule.getSeats().size())
                .build();
    }



    private DriverScheduleResponse convertToDriverScheduleResponseWithPassengers(Schedule schedule) {
        DriverScheduleResponse response = convertToDriverScheduleResponse(schedule);

        List<Booking> bookings = bookingRepository.findByScheduleAndStatus(
                schedule, Booking.BookingStatus.Confirmed);

        List<PassengerInfoResponse> passengers = new ArrayList<>();
        for (Booking booking : bookings) {
            for (Seat seat : booking.getSeats()) {
                passengers.add(convertToPassengerInfoResponse(seat));
            }
        }
        response.setPassengers(passengers);

        Map<Location, Integer> pickupCountMap = new HashMap<>();
        Map<Location, Integer> dropoffCountMap = new HashMap<>();
        for (Booking booking : bookings) {
            Location pickup = booking.getPickUpLocation();
            Location dropoff = booking.getDropOffLocation();
            int count = booking.getSeats() != null ? booking.getSeats().size() : 0;
            if (pickup != null) pickupCountMap.put(pickup, pickupCountMap.getOrDefault(pickup, 0) + count);
            if (dropoff != null) dropoffCountMap.put(dropoff, dropoffCountMap.getOrDefault(dropoff, 0) + count);
        }

        List<LocationStopResponse> stops = new ArrayList<>();
        for (Map.Entry<Location, Integer> e : pickupCountMap.entrySet()) {
            Location l = e.getKey();
            stops.add(LocationStopResponse.builder()
                    .locationId(l.getLocationId())
                    .locationName(l.getName())
                    .address(null)     // Location chưa có field này
                    .latitude(0.0)     // Location chưa có field này
                    .longitude(0.0)    // Location chưa có field này
                    .isPickup(true)
                    .isDropoff(false)
                    .passengerCount(e.getValue())
                    .build());
        }
        for (Map.Entry<Location, Integer> e : dropoffCountMap.entrySet()) {
            Location l = e.getKey();
            stops.add(LocationStopResponse.builder()
                    .locationId(l.getLocationId())
                    .locationName(l.getName())
                    .address(null)
                    .latitude(0.0)
                    .longitude(0.0)
                    .isPickup(false)
                    .isDropoff(true)
                    .passengerCount(e.getValue())
                    .build());
        }

        response.setStops(stops);
        return response;
    }



    private PassengerInfoResponse convertToPassengerInfoResponse(Seat seat) {
        List<Booking> bookings = bookingRepository
                .findBySeats_SeatIdAndStatus(seat.getSeatId(), Booking.BookingStatus.Confirmed);
        if (bookings == null || bookings.isEmpty()) {
            throw new RuntimeException("No confirmed booking found for this seat");
        }

        Booking booking = bookings.get(0);
        User passenger = booking.getUser();
        if (passenger == null) throw new RuntimeException("No passenger found for this booking");
        if (booking.getPickUpLocation() == null || booking.getDropOffLocation() == null) {
            throw new RuntimeException("Pickup or dropoff location missing for booking");
        }

        return PassengerInfoResponse.builder()
                .bookingId(booking.getBookingId())
                .seatId(seat.getSeatId())
                .seatNumber(seat.getSeatNumber())
                .passengerName((passenger.getFirstName() != null ? passenger.getFirstName() : "") +
                        " " +
                        (passenger.getLastName() != null ? passenger.getLastName() : ""))
                .phoneNumber(passenger.getPhoneNumber())
                .pickupLocationName(booking.getPickUpLocation().getName())
                .dropoffLocationName(booking.getDropOffLocation().getName())
                .isBoarded(seat.getCheckInTime() != null)
                .boardingTime(seat.getCheckInTime())
                .isDisembarked(seat.getCheckOutTime() != null)
                .disembarkingTime(seat.getCheckOutTime())
                .luggageCount(seat.getBaggageCount())
                .luggageTags(null) // Chưa có field; nếu cần, bổ sung column trong Seat
                .build();
    }

}