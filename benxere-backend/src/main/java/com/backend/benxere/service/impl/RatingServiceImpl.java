package com.backend.benxere.service.impl;

import com.backend.benxere.dto.request.ApiResponse;
import com.backend.benxere.dto.request.RatingRequest;
import com.backend.benxere.dto.response.RatingResponse;
import com.backend.benxere.entity.Bus;
import com.backend.benxere.entity.Rating;
import com.backend.benxere.entity.Schedule;
import com.backend.benxere.entity.User;
import com.backend.benxere.entity.Booking;
import com.backend.benxere.repository.BusRepository;
import com.backend.benxere.repository.RatingRepository;
import com.backend.benxere.repository.ScheduleRepository;
import com.backend.benxere.repository.UserRepository;
import com.backend.benxere.repository.BookingRepository;
import com.backend.benxere.service.RatingService;
import com.backend.benxere.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class RatingServiceImpl implements RatingService {    private final RatingRepository ratingRepository;
    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final BusRepository busRepository;
    private final BookingRepository bookingRepository;

    public RatingServiceImpl(
            RatingRepository ratingRepository,
            ScheduleRepository scheduleRepository,
            UserRepository userRepository,
            UserService userService,
            BusRepository busRepository,
            BookingRepository bookingRepository) {
        this.ratingRepository = ratingRepository;
        this.scheduleRepository = scheduleRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.busRepository = busRepository;
        this.bookingRepository = bookingRepository;
    }    @Override
    @Transactional
    public RatingResponse createRating(RatingRequest request) {
        User currentUser = userService.getCurrentUser();
        
        Schedule schedule = scheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new EntityNotFoundException("Schedule not found"));
        
        Bus bus;
        if (request.getBusId() != null) {
            bus = busRepository.findById(request.getBusId())
                    .orElseThrow(() -> new EntityNotFoundException("Bus not found"));
        } else {
            bus = schedule.getBus();
        }
        
        Rating rating = new Rating();
        rating.setUser(currentUser);
        rating.setSchedule(schedule);
        rating.setBus(bus);
        rating.setRating(request.getRating());
        rating.setComment(request.getComment());
        rating.setCreatedAt(Timestamp.from(Instant.now()));
        
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            String imageUrl = saveImage(request.getImage());
            rating.setImageUrl(imageUrl);
        }
        
        Rating savedRating = ratingRepository.save(rating);
        
        List<Booking> userBookings = bookingRepository.findByUserAndSchedule(currentUser, schedule);
        if (!userBookings.isEmpty()) {
            Booking booking = userBookings.get(0);
            booking.setIsRated(true);
            bookingRepository.save(booking);
        }
        
        return toResponse(savedRating);
    }

    @Override
    public RatingResponse updateRating(int ratingId, RatingRequest request) {
        Rating rating = getRatingByIdAndCurrentUser(ratingId);
        rating.setRating(request.getRating());
        rating.setComment(request.getComment());
        return toResponse(ratingRepository.save(rating));
    }

    @Override
    public void deleteRating(int ratingId) {
        Rating rating = getRatingByIdAndCurrentUser(ratingId);
        ratingRepository.delete(rating);
    }

    @Override
    public RatingResponse getRatingById(int ratingId) {
        Rating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new EntityNotFoundException("Rating not found"));
        return toResponse(rating);
    }

    @Override
    public List<RatingResponse> getRatingsBySchedule(int scheduleId) {
        return ratingRepository.findByScheduleScheduleId(scheduleId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RatingResponse> getCurrentUserRatings() {
        User currentUser = userService.getCurrentUser();
        return ratingRepository.findByUser(currentUser).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<RatingResponse> getRatingsByCompany(String companyName, Pageable pageable) {
        return ratingRepository.findByScheduleBusCompanyName(companyName, pageable)
                .map(this::toResponse);
    }

    @Override
    public double getAverageRatingByCompany(String companyName) {
        return ratingRepository.getAverageRatingByCompanyName(companyName);
    }

    @Override
    public long getRatingCountByCompany(String companyName) {
        return ratingRepository.countByScheduleBusCompanyName(companyName);
    }

    @Override
    public Page<RatingResponse> getRatingsByBus(Integer busId, Pageable pageable) {
        return ratingRepository.findByScheduleBusBusId(busId, pageable)
                .map(this::toResponse);
    }

    @Override
    public double getAverageRatingByBus(Integer busId) {
        return ratingRepository.getAverageRatingByBusId(busId);
    }

    @Override
    public long getRatingCountByBus(Integer busId) {
        return ratingRepository.countByScheduleBusBusId(busId);
    }

    @Override
    public Page<RatingResponse> getRatingsByOwner(Integer ownerId, Pageable pageable) {
        return ratingRepository.findByScheduleBusOwnerUserId(ownerId, pageable)
                .map(this::toResponse);
    }

    @Override
    public double getAverageRatingByOwner(Integer ownerId) {
        return ratingRepository.getAverageRatingByBusOwnerId(ownerId);
    }

    @Override
    public long getRatingCountByOwner(Integer ownerId) {
        return ratingRepository.countByScheduleBusOwnerUserId(ownerId);
    }

    @Override
    public RatingRequest processRatingRequest(boolean isMultipart, RatingRequest jsonRequest, 
                                             RatingRequest formRequest, HttpServletRequest request) {
        RatingRequest ratingRequest;
        
        if (isMultipart) {
            log.info("Processing multipart form data request");
            ratingRequest = formRequest;
            
            if (ratingRequest.getBusId() == null) {
                String busIdParam = request.getParameter("busId");
                if (busIdParam != null && !busIdParam.isEmpty()) {
                    try {
                        ratingRequest.setBusId(Integer.parseInt(busIdParam));
                    } catch (NumberFormatException e) {
                        throw new IllegalArgumentException("Bus ID must be a number");
                    }
                } else {
                    throw new IllegalArgumentException("Bus ID is required");
                }
            }
            
            if (ratingRequest.getRating() < 1 || ratingRequest.getRating() > 5) {
                String ratingParam = request.getParameter("rating");
                if (ratingParam != null && !ratingParam.isEmpty()) {
                    try {
                        int rating = Integer.parseInt(ratingParam);
                        if (rating >= 1 && rating <= 5) {
                            ratingRequest.setRating(rating);
                        } else {
                            throw new IllegalArgumentException("Rating must be between 1 and 5");
                        }
                    } catch (NumberFormatException e) {
                        throw new IllegalArgumentException("Rating must be a number between 1 and 5");
                    }
                } else {
                    throw new IllegalArgumentException("Rating is required and must be between 1 and 5");
                }
            }
        } else {
            log.info("Processing JSON request");
            ratingRequest = jsonRequest;
            
            // Basic validation for JSON requests
            if (ratingRequest == null) {
                throw new IllegalArgumentException("Request body is required");
            }
            if (ratingRequest.getBusId() == null) {
                throw new IllegalArgumentException("Bus ID is required");
            }
            if (ratingRequest.getRating() < 1 || ratingRequest.getRating() > 5) {
                throw new IllegalArgumentException("Rating must be between 1 and 5");
            }
        }
        
        log.info("Processed rating request: busId={}, rating={}, scheduleId={}", 
                ratingRequest.getBusId(), ratingRequest.getRating(), ratingRequest.getScheduleId());
        
        return ratingRequest;
    }

    @Override
    public List<RatingResponse> getAllRatings() {
        return ratingRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ApiResponse<List<RatingResponse>> getRatingsByScheduleId(int scheduleId) {
        List<RatingResponse> ratings = getRatingsBySchedule(scheduleId);
        return ApiResponse.<List<RatingResponse>>builder()
                .result(ratings)
                .build();
    }

    @Override
    public ApiResponse<List<RatingResponse>> getRatingsByBusId(int busId) {
        // Using the correct repository method findByScheduleBusBusId
        List<RatingResponse> ratings = ratingRepository.findByScheduleBusBusId(busId, Pageable.unpaged())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ApiResponse.<List<RatingResponse>>builder()
                .result(ratings)
                .build();
    }

    @Override
    public List<RatingResponse> getOwnerRatings(Integer ownerId) {
        return ratingRepository.findByScheduleBusOwnerUserId(ownerId, Pageable.unpaged())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RatingResponse> getAllRatingsByCompany(String companyName) {
        return ratingRepository.findByScheduleBusCompanyName(companyName, Pageable.unpaged())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private Rating getRatingByIdAndCurrentUser(int ratingId) {
        User currentUser = userService.getCurrentUser();
        return ratingRepository.findByRatingIdAndUser(ratingId, currentUser)
                .orElseThrow(() -> new EntityNotFoundException("Rating not found or unauthorized"));
    }

    private RatingResponse toResponse(Rating rating) {
        return RatingResponse.builder()
                .id(rating.getRatingId())
                .userId(rating.getUser().getUserId())
                .userEmail(rating.getUser().getEmail())
                .scheduleId(rating.getSchedule().getScheduleId())
                .rating(rating.getRating())
                .comment(rating.getComment())
                .imageUrl(rating.getImageUrl())
                .createdAt(rating.getCreatedAt().toLocalDateTime())
                .companyName(rating.getSchedule().getBus().getCompanyName())
                .busId(rating.getSchedule().getBus().getBusId())
                .busOwnerId(rating.getSchedule().getBus().getOwner().getUserId())
                .build();
    }

    private String saveImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            return null;
        }
        
        try {
            String uploadDir = "uploads/ratings";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            String originalFilename = image.getOriginalFilename();
            String extension = originalFilename != null ? 
                    originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            String filename = UUID.randomUUID().toString() + extension;
            
            Path filePath = uploadPath.resolve(filename);
            Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            return "/uploads/ratings/" + filename;
        } catch (IOException e) {
            log.error("Failed to save image file", e);
            throw new RuntimeException("Failed to save image file: " + e.getMessage());
        }
    }
}