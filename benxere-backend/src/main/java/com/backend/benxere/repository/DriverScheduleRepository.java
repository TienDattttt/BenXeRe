package com.backend.benxere.repository;

import com.backend.benxere.entity.Schedule;
import com.backend.benxere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DriverScheduleRepository extends JpaRepository<Schedule, Integer> {

    List<Schedule> findByDriver(User driver);
    
    List<Schedule> findByDriverAndDepartureTimeAfter(User driver, LocalDateTime now);
    
    List<Schedule> findByDriverAndDepartureTimeBetween(
        User driver, LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT s FROM Schedule s WHERE s.driver.userId = :userId AND " +
           "((s.departureTime <= :now AND s.arrivalTime >= :now) OR " +
           "(s.departureTime > :now AND s.departureTime <= :dayEnd))")
    List<Schedule> findTodayAndUpcomingSchedules(int userId, LocalDateTime now, LocalDateTime dayEnd);
}