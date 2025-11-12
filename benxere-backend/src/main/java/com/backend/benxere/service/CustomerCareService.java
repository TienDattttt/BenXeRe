package com.backend.benxere.service;

import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.benxere.dto.request.BookingCreationRequest;
import com.backend.benxere.dto.request.SeatChangeRequest;
import com.backend.benxere.dto.request.SeatRequest;
import com.backend.benxere.dto.response.BookingResponse;
import com.backend.benxere.dto.response.ScheduleResponse;
import com.backend.benxere.dto.response.SeatResponse;
import com.backend.benxere.entity.User;
import com.backend.benxere.entity.Booking;
import com.backend.benxere.entity.Seat;
import com.backend.benxere.entity.Schedule;
import com.backend.benxere.exception.AppException;
import com.backend.benxere.exception.ErrorCode;
import com.backend.benxere.repository.UserRepository;
import com.backend.benxere.repository.BookingRepository;
import com.backend.benxere.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerCareService {
    
    private final ScheduleService scheduleService;
    private final UserRepository userRepository;
    private final BookingService bookingService;
    private final SeatService seatService;
    private final BookingRepository bookingRepository;
    private final SeatRepository seatRepository;    public List<ScheduleResponse> getBusOwnerSchedules() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User customerCare = userRepository.findByEmail(email)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED, "User not found"));
        
        User busOwner = customerCare.getManager();
        if (busOwner == null) {
            throw new AppException(ErrorCode.ACCESS_DENIED, "Customer care staff must be assigned to a bus owner");
        }
        
        return scheduleService.getSchedulesByBusOwner(busOwner.getUserId());
    }

    @Transactional
    public BookingResponse createBookingForCustomer(BookingCreationRequest request) {
        User customer = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED, "Customer not found"));

        Schedule schedule = scheduleService.getScheduleEntityById(request.getScheduleId());
        if (schedule == null) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Schedule not found");
        }
        validateCustomerCareAccess(schedule);

        return bookingService.createBookingForCustomer(request, customer);
    }

    @Transactional
    public SeatResponse updateSeatStatus(int seatId, boolean isBooked) {
        Seat seat = seatRepository.findById(seatId)
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Seat not found"));
        
        validateCustomerCareAccess(seat.getSchedule());
        
        SeatRequest seatRequest = new SeatRequest();
        seatRequest.setScheduleId(seat.getSchedule().getScheduleId());
        seatRequest.setSeatNumber(seat.getSeatNumber());
        seatRequest.setBooked(isBooked);
        if (seat.getBookedBy() != null) {
            seatRequest.setBookedById(seat.getBookedBy().getUserId());
        }
        
        return seatService.updateSeat(seatId, seatRequest);
    }

    @Transactional
    public BookingResponse changeCustomerSeats(SeatChangeRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Booking not found"));
        
        validateCustomerCareAccess(booking.getSchedule());

        List<Seat> oldSeats = seatRepository.findAllById(request.getOldSeatIds());
        if (oldSeats.size() != request.getOldSeatIds().size()) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Some old seats not found");
        }
        
        for (Seat seat : oldSeats) {
            if (!booking.getSeats().contains(seat)) {
                throw new AppException(ErrorCode.BAD_REQUEST, "Seat " + seat.getSeatId() + " does not belong to this booking");
            }
        }
        
        List<Seat> newSeats = seatRepository.findAllById(request.getNewSeatIds());
        if (newSeats.size() != request.getNewSeatIds().size()) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Some new seats not found");
        }
        
        Schedule schedule = booking.getSchedule();
        for (Seat seat : newSeats) {
            if (seat.getSchedule().getScheduleId() != schedule.getScheduleId()) {
                throw new AppException(ErrorCode.BAD_REQUEST, "Seat " + seat.getSeatId() + " is not from the same schedule");
            }
            if (seat.isBooked()) {
                throw new AppException(ErrorCode.BAD_REQUEST, "Seat " + seat.getSeatId() + " is already booked");
            }
        }
        
        BookingCreationRequest updateRequest = new BookingCreationRequest();
        updateRequest.setScheduleId(schedule.getScheduleId());
        updateRequest.setSeatIds(request.getNewSeatIds());
        updateRequest.setPickUpLocationId(booking.getPickUpLocation().getLocationId());
        updateRequest.setDropOffLocationId(booking.getDropOffLocation().getLocationId());
        
        for (Seat seat : oldSeats) {
            SeatRequest seatRequest = new SeatRequest();
            seatRequest.setScheduleId(seat.getSchedule().getScheduleId());
            seatRequest.setSeatNumber(seat.getSeatNumber());
            seatRequest.setBooked(false);
            seatService.updateSeat(seat.getSeatId(), seatRequest);
        }
        
        for (Seat seat : newSeats) {
            SeatRequest seatRequest = new SeatRequest();
            seatRequest.setScheduleId(seat.getSchedule().getScheduleId());
            seatRequest.setSeatNumber(seat.getSeatNumber());
            seatRequest.setBooked(true);
            seatRequest.setBookedById(booking.getUser().getUserId());
            seatService.updateSeat(seat.getSeatId(), seatRequest);
        }
        
        return bookingService.updateBooking(request.getBookingId(), updateRequest);
    }

    private void validateCustomerCareAccess(Schedule schedule) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User customerCare = userRepository.findByEmail(email)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED, "User not found"));
        
        User busOwner = customerCare.getManager();
        if (busOwner == null || schedule.getBus().getOwner().getUserId() != busOwner.getUserId()) {
            throw new AppException(ErrorCode.ACCESS_DENIED, "You don't have access to this schedule");
        }
    }
}
