package com.backend.benxere.repository;

import com.backend.benxere.entity.Attendance;
import com.backend.benxere.entity.Schedule;
import com.backend.benxere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {
    
    List<Attendance> findByUser(User user);
    
    List<Attendance> findByUserAndCheckInTimeBetween(User user, LocalDateTime start, LocalDateTime end);
    
    Optional<Attendance> findByUserAndSchedule(User user, Schedule schedule);
    
    @Query("SELECT a FROM Attendance a WHERE a.user.userId = :userId AND " +
           "FUNCTION('DATE', a.checkInTime) = FUNCTION('DATE', :date)")
    List<Attendance> findByUserAndDate(int userId, LocalDateTime date);
}