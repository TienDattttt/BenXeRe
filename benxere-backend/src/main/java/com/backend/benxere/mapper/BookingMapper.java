package com.backend.benxere.mapper;

import com.backend.benxere.dto.request.BookingCreationRequest;
import com.backend.benxere.dto.response.BookingResponse;
import com.backend.benxere.entity.Booking;
import com.backend.benxere.entity.Seat;
import com.backend.benxere.entity.User;

import java.util.List;
import java.util.stream.Collectors;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Mapper(componentModel = "spring", uses = {UserMapper.class, SeatMapper.class})
public interface BookingMapper {
    BookingMapper INSTANCE = Mappers.getMapper(BookingMapper.class);

    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "schedule.scheduleId", target = "scheduleId")
    @Mapping(source = "seats", target = "seatIds")
    @Mapping(source = "pickUpLocation.locationId", target = "pickUpLocationId")
    @Mapping(source = "dropOffLocation.locationId", target = "dropOffLocationId")
    BookingResponse toBookingResponse(Booking booking);

    @Mapping(source = "request.scheduleId", target = "schedule.scheduleId")
    Booking toBooking(BookingCreationRequest request);

    default Timestamp map(LocalDateTime value) {
        return value == null ? null : Timestamp.valueOf(value);
    }

    default List<Integer> map(List<Seat> seats) {
        return seats == null ? null : seats.stream()
                .map(Seat::getSeatId)
                .collect(Collectors.toList());
    }

    default String map(User value) {
        return value == null ? null : value.getEmail();
    }
}