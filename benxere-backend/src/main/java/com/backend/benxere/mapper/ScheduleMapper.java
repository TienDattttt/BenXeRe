package com.backend.benxere.mapper;

import com.backend.benxere.dto.request.ScheduleRequest;
import com.backend.benxere.dto.response.BusImageResponse;
import com.backend.benxere.dto.response.PickupDropoffLocationResponse;
import com.backend.benxere.dto.response.ScheduleResponse;
import com.backend.benxere.entity.BusImage;
import com.backend.benxere.entity.Location;
import com.backend.benxere.entity.Schedule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(
        componentModel = "spring",
        uses = { UserMapper.class, SeatMapper.class },
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface ScheduleMapper {

    // Map thẳng LocalDateTime -> LocalDateTime (KHÔNG toTimestamp)
    @Mapping(target = "scheduleId", ignore = true)
    @Mapping(source = "busId", target = "bus.busId")
    @Mapping(source = "routeId", target = "route.routeId")
    @Mapping(source = "driverId", target = "driver.userId")
    @Mapping(source = "assistantId", target = "assistant.userId")
    @Mapping(target = "departureTime", source = "departureTime")
    @Mapping(target = "arrivalTime", source = "arrivalTime")
    @Mapping(target = "actualEndTime", ignore = true)
    @Mapping(target = "actualStartTime", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "dropOffLocations", ignore = true)
    @Mapping(target = "issues", ignore = true)
    @Mapping(target = "pickUpLocations", ignore = true)
    @Mapping(target = "scheduleLocations", ignore = true)
    @Mapping(target = "seats", ignore = true)
    @Mapping(target = "secondDriver", ignore = true)
    @Mapping(target = "status", ignore = true)
    Schedule toSchedule(ScheduleRequest request);

    // Map thẳng LocalDateTime -> LocalDateTime ở response
    // createdAt của Schedule là Timestamp, nếu ScheduleResponse.createdAt cũng là Timestamp
    // thì không cần convert; giữ map mặc định.
    @Mapping(source = "bus", target = "bus")
    @Mapping(source = "route", target = "route")
    @Mapping(source = "driver", target = "driver")
    @Mapping(source = "assistant", target = "assistant")
    @Mapping(source = "departureTime", target = "departureTime")
    @Mapping(source = "arrivalTime", target = "arrivalTime")
    @Mapping(source = "pickUpLocations", target = "pickUpLocations",
            qualifiedByName = "locationSetToPickupDropoffLocationResponseList")
    @Mapping(source = "dropOffLocations", target = "dropOffLocations",
            qualifiedByName = "locationSetToPickupDropoffLocationResponseList")
    @Mapping(target = "locations", ignore = true)
    ScheduleResponse toResponse(Schedule schedule);

    // === Helpers còn lại vẫn dùng được khi cần ===
    @Named("timestampToLocalDateTime")
    default LocalDateTime timestampToLocalDateTime(Timestamp timestamp) {
        return timestamp != null ? timestamp.toLocalDateTime() : null;
    }

    @Named("locationSetToPickupDropoffLocationResponseList")
    default List<PickupDropoffLocationResponse> locationSetToPickupDropoffLocationResponseList(Set<Location> locations) {
        if (locations == null || locations.isEmpty()) return List.of();
        return locations.stream()
                .map(l -> new PickupDropoffLocationResponse(l.getLocationId(), l.getName(), l.getCreatedAt()))
                .collect(Collectors.toList());
    }

    // Giữ lại nếu sau này cần convert cho field khác (không dùng cho departure/arrival)
    default Timestamp toTimestamp(LocalDateTime localDateTime) {
        return localDateTime != null ? Timestamp.valueOf(localDateTime) : null;
    }

    default BusImageResponse busImageToBusImageResponse(BusImage image) {
        if (image == null) return null;
        return BusImageResponse.builder()
                .imageId(image.getImageId())
                .imageName(image.getImageName())
                .imageType(image.getImageType())
                .imageUrl(image.getImageUrl())
                .build();
    }

    default List<BusImageResponse> busImageListToBusImageResponseList(List<BusImage> images) {
        if (images == null) return List.of();
        return images.stream().map(this::busImageToBusImageResponse).toList();
    }
}
