package com.backend.benxere.service;

import com.backend.benxere.dto.request.SeatRequest;
import com.backend.benxere.dto.request.SeatUpdateRequest;
import com.backend.benxere.dto.response.SeatResponse;
import com.backend.benxere.entity.Seat;
import com.backend.benxere.entity.User;
import com.backend.benxere.exception.AppException;
import com.backend.benxere.exception.ErrorCode;
import com.backend.benxere.mapper.SeatMapper;
import com.backend.benxere.repository.SeatRepository;
import com.backend.benxere.repository.UserRepository;
import com.backend.benxere.service.qrcode.QRCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeatServiceImpl {
    private final SeatRepository seatRepository;
    private final SeatMapper seatMapper;
    private final UserRepository userRepository;
    private final QRCodeService qrCodeService;

    public SeatResponse createSeat(SeatRequest seatRequest) {
        Seat seat = seatMapper.toEntity(seatRequest);
        Seat savedSeat = seatRepository.save(seat);
        return seatMapper.toSeatResponse(savedSeat);
    }

    public SeatResponse getSeatById(int id) {
        Seat seat = seatRepository.findById(id).orElseThrow(() -> new RuntimeException("Seat not found"));
        return seatMapper.toSeatResponse(seat);
    }

    public List<SeatResponse> getAllSeats() {
        return seatRepository.findAll().stream()
                .map(seatMapper::toSeatResponse)
                .collect(Collectors.toList());
    }

    public SeatResponse updateSeat(int id, SeatRequest seatRequest) {
        Seat existingSeat = seatRepository.findById(id).orElseThrow(() -> new RuntimeException("Seat not found"));
        seatMapper.updateEntityFromRequest(seatRequest, existingSeat);
        Seat updatedSeat = seatRepository.save(existingSeat);
        return seatMapper.toSeatResponse(updatedSeat);
    }

    public void deleteSeat(int id) {
        seatRepository.deleteById(id);
    }

    public List<SeatResponse> getSeatsByScheduleId(int scheduleId) {
        return seatRepository.findAllByScheduleScheduleId(scheduleId).stream()
                .map(seatMapper::toSeatResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public SeatResponse checkInPassenger(int seatId) {
        Seat seat = getSeatEntityById(seatId);
        validateDriverAccessToSeat(seat);
        
        seat.setCheckInTime(LocalDateTime.now());
        seat.setPassengerStatus("CHECKED_IN");
        updateLastModifiedInfo(seat);
        
        return seatMapper.toSeatResponse(seatRepository.save(seat));
    }
    
    @Transactional
    public SeatResponse checkOutPassenger(int seatId) {
        Seat seat = getSeatEntityById(seatId);
        validateDriverAccessToSeat(seat);
        
        seat.setCheckOutTime(LocalDateTime.now());
        seat.setPassengerStatus("CHECKED_OUT");
        updateLastModifiedInfo(seat);
        
        return seatMapper.toSeatResponse(seatRepository.save(seat));
    }
    
    @Transactional
    public SeatResponse updateSeatByDriver(int seatId, SeatUpdateRequest request) {
        Seat seat = getSeatEntityById(seatId);
        validateDriverAccessToSeat(seat);
        
        if (request.getCheckInTime() != null) {
            seat.setCheckInTime(request.getCheckInTime());
        }
        
        if (request.getCheckOutTime() != null) {
            seat.setCheckOutTime(request.getCheckOutTime());
        }
        
        if (request.getPassengerStatus() != null) {
            seat.setPassengerStatus(request.getPassengerStatus());
        }
        
        if (request.getDriverNotes() != null) {
            seat.setDriverNotes(request.getDriverNotes());
        }
        
        if (request.getBaggageCount() != null) {
            seat.setBaggageCount(request.getBaggageCount());
        }
        
        updateLastModifiedInfo(seat);
        
        return seatMapper.toSeatResponse(seatRepository.save(seat));
    }
    
    @Transactional
    public SeatResponse updatePassengerStatus(int seatId, String status) {
        Seat seat = getSeatEntityById(seatId);
        validateDriverAccessToSeat(seat);
        
        seat.setPassengerStatus(status);
        updateLastModifiedInfo(seat);
        
        return seatMapper.toSeatResponse(seatRepository.save(seat));
    }
    
    @Transactional
    public SeatResponse addDriverNotes(int seatId, String notes) {
        Seat seat = getSeatEntityById(seatId);
        validateDriverAccessToSeat(seat);
        
        seat.setDriverNotes(notes);
        updateLastModifiedInfo(seat);
        
        return seatMapper.toSeatResponse(seatRepository.save(seat));
    }
    
    @Transactional
    public SeatResponse updateBaggageCount(int seatId, int count) {
        Seat seat = getSeatEntityById(seatId);
        validateDriverAccessToSeat(seat);
        
        seat.setBaggageCount(count);
        updateLastModifiedInfo(seat);
        
        return seatMapper.toSeatResponse(seatRepository.save(seat));
    }
      @Transactional
    public SeatResponse bookSeatWithQRCode(int seatId, User user) {
        Seat seat = getSeatEntityById(seatId);
        
        if (seat.isBooked()) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Seat is already booked");
        }
        
        seat.setBooked(true);
        seat.setBookedBy(user);
        seat.setBookedAt(LocalDateTime.now());
        seat.setPassengerStatus("PENDING");
        String qrCodeData = qrCodeService.generateQRCodeForSeat(seat);
        seat.setQrCodeData(qrCodeData);
        seat.setQrCodeScannedCount(0);
        
        Seat savedSeat = seatRepository.save(seat);
        return seatMapper.toSeatResponse(savedSeat);
    }
    
    @Transactional
    public SeatResponse processSeatQRCodeScan(String qrCodeContent) {
        int seatId = qrCodeService.verifyAndExtractSeatId(qrCodeContent);
        
        Seat seat = getSeatEntityById(seatId);
        
        int scanCount = seat.getQrCodeScannedCount() != null ? seat.getQrCodeScannedCount() : 0;
        seat.setQrCodeScannedCount(scanCount + 1);
        seat.setLastQrScanTime(LocalDateTime.now());
        
        if (scanCount == 0) {
            seat.setCheckInTime(LocalDateTime.now());
            seat.setPassengerStatus("CHECKED_IN");
        } else {
            seat.setCheckOutTime(LocalDateTime.now());
            seat.setPassengerStatus("CHECKED_OUT");
        }
        
        updateLastModifiedInfo(seat);
        return seatMapper.toSeatResponse(seatRepository.save(seat));
    }
    
    private Seat getSeatEntityById(int seatId) {
        return seatRepository.findById(seatId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Seat not found"));
    }
    
    private void validateDriverAccessToSeat(Seat seat) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User driver = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        User scheduleDriver = seat.getSchedule().getDriver();
        User scheduleAssistant = seat.getSchedule().getAssistant();
        
        if ((scheduleDriver == null || scheduleDriver.getUserId() != driver.getUserId()) &&
            (scheduleAssistant == null || scheduleAssistant.getUserId() != driver.getUserId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED, "You are not authorized to update this seat");
        }
    }
    
    private void updateLastModifiedInfo(Seat seat) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User driver = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        seat.setLastUpdatedBy(driver.getUserId());
        seat.setLastUpdatedAt(LocalDateTime.now());
    }
}