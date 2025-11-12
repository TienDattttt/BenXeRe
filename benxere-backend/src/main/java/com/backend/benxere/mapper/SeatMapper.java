package com.backend.benxere.mapper;

import com.backend.benxere.dto.request.SeatRequest;
import com.backend.benxere.dto.response.SeatResponse;
import com.backend.benxere.entity.Seat;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = {ScheduleMapper.class, UserMapper.class})
public interface SeatMapper {
    @Mapping(source = "bookedBy", target = "user")
    @Mapping(source = "qrCodeData", target = "qrCodeData")
    @Mapping(source = "qrCodeScannedCount", target = "qrCodeScannedCount")
    @Mapping(source = "lastQrScanTime", target = "lastQrScanTime")
    @Mapping(source = "booked" ,target = "isBooked")
    @Mapping(source = "bookedAt", target = "bookedAt")
    SeatResponse toSeatResponse(Seat seat);

    @Mapping(source = "bookedById", target = "bookedBy.userId")
    Seat toEntity(SeatRequest seatRequest);

    @Mapping(source = "bookedById", target = "bookedBy.userId")
    void updateEntityFromRequest(SeatRequest seatRequest, @MappingTarget Seat seat);
}