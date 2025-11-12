package com.backend.benxere.mapper;

import com.backend.benxere.dto.request.RatingRequest;
import com.backend.benxere.dto.response.RatingResponse;
import com.backend.benxere.entity.Rating;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Mapper(
    componentModel = "spring",
    uses = {UserMapper.class},
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface RatingMapper {

    @Mapping(target = "ratingId", ignore = true)
    @Mapping(source = "scheduleId", target = "schedule.scheduleId")
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", expression = "java(getCurrentTimestamp())")
    Rating toRating(RatingRequest request);

    @Mapping(source = "ratingId", target = "id")
    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "user.email", target = "userEmail")
    @Mapping(source = "schedule.scheduleId", target = "scheduleId")
    @Mapping(source = "schedule.bus.busId", target = "busId")
    @Mapping(source = "schedule.bus.companyName", target = "companyName")
    @Mapping(source = "schedule.bus.owner.userId", target = "busOwnerId")
    @Mapping(source = "createdAt", target = "createdAt", qualifiedByName = "timestampToLocalDateTime")
    RatingResponse toResponse(Rating rating);

    @Named("getCurrentTimestamp")
    default Timestamp getCurrentTimestamp() {
        return Timestamp.from(java.time.Instant.now());
    }

    @Named("timestampToLocalDateTime")
    default LocalDateTime timestampToLocalDateTime(Timestamp timestamp) {
        return timestamp != null ? timestamp.toLocalDateTime() : null;
    }
}