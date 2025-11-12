package com.backend.benxere.service;

import com.backend.benxere.entity.*;
import com.backend.benxere.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CleanupSchedulerService {
    private static final Logger logger = LoggerFactory.getLogger(CleanupSchedulerService.class);

    private final ScheduleRepository scheduleRepository;
    private final PaymentRepository paymentRepository;
    private final RatingRepository ratingRepository;
    private final BookingRepository bookingRepository;

    public CleanupSchedulerService(
            ScheduleRepository scheduleRepository,
            PaymentRepository paymentRepository,
            RatingRepository ratingRepository,
            BookingRepository bookingRepository) {
        this.scheduleRepository = scheduleRepository;
        this.paymentRepository = paymentRepository;
        this.ratingRepository = ratingRepository;
        this.bookingRepository = bookingRepository;
    }

    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void cleanupOldData() {
        logger.info("Starting scheduled cleanup job at {}", LocalDateTime.now());
        int cleanedSchedules = cleanupOldSchedules();
        cleanupPendingPayments();
        cleanupPendingBookings();

    }

    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void hourlyCleanup() {
        logger.info("Starting hourly cleanup job at {}", LocalDateTime.now());
        cleanupPendingPayments();
        cleanupPendingBookings();
    }

    @Scheduled(fixedRate = 900000)
    @Transactional
    public void frequentCleanup() {
        cleanupPendingPayments();
        cleanupPendingBookings();
    }

    @Scheduled(fixedRate = 300000)
    public void logSchedulerStatus() {
        logger.info("Scheduler is active and running at {}", LocalDateTime.now());
    }

    private int cleanupOldSchedules() {
        try {
            Timestamp twoMonthsAgo = Timestamp.from(Instant.now().minus(60, ChronoUnit.DAYS));
            List<Schedule> oldSchedules = scheduleRepository.findByDepartureTimeBefore(twoMonthsAgo);
            
            logger.info("Found {} old schedules to clean up", oldSchedules.size());
            
            if (oldSchedules.isEmpty()) {
                return 0;
            }
            
            int count = 0;
            for (Schedule schedule : oldSchedules) {
                try {
                    List<Rating> ratings = ratingRepository.findBySchedule(schedule);
                    logger.info("Updating {} ratings for schedule {}", ratings.size(), schedule.getScheduleId());
                    
                    for (Rating rating : ratings) {
                        rating.setBus(schedule.getBus());
                        rating.setSchedule(null);
                        ratingRepository.save(rating);
                        logger.info("Updated rating ID {} to reference bus directly", rating.getRatingId());
                    }
                    
                    scheduleRepository.delete(schedule);
                    count++;
                    logger.info("Deleted schedule ID {}", schedule.getScheduleId());
                } catch (Exception e) {
                    logger.error("Error deleting schedule {}: {}", schedule.getScheduleId(), e.getMessage(), e);
                }
            }
            
            logger.info("Successfully cleaned up {} old schedules", count);
            return count;
        } catch (Exception e) {
            logger.error("Error cleaning up old schedules", e);
            return 0;
        }
    }

    private void cleanupPendingPayments() {
        paymentRepository.deleteOldPendingPayments(Timestamp.from(Instant.now().minus(30, ChronoUnit.MINUTES)));
    }
    
    private void cleanupPendingBookings() {
        List<Booking> pendingBookings = bookingRepository.findByStatus(Booking.BookingStatus.Pending);
        for (Booking booking : pendingBookings) {
            if (booking.getCreatedAt().before(Timestamp.from(Instant.now().minus(30, ChronoUnit.MINUTES)))) {
                bookingRepository.delete(booking);
                logger.info("Deleted old pending booking ID {}", booking.getBookingId());
            }
        }

    }
}