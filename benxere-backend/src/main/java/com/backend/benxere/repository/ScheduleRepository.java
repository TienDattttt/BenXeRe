package com.backend.benxere.repository;

import com.backend.benxere.entity.Schedule;
import com.backend.benxere.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.sql.Timestamp;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Integer> {
    List<Schedule> findByDepartureTimeBefore(Timestamp timestamp);
    List<Schedule> findByBus_BusId(int busId);
    int getBusIdByScheduleId(int scheduleId);
    List<Schedule> findAllByDriver(User driver);
    List<Schedule> findAllBySecondDriver(User secondDriver);
    List<Schedule> findAllByAssistant(User assistant);
    @Query("""
        select s from Schedule s
        where s.assistant.userId = :assistantId
          and s.departureTime between :now and :endOfDay
        order by s.departureTime asc
    """)
    List<Schedule> findTodayAndUpcomingSchedulesForAssistant(
            @Param("assistantId") int assistantId,
            @Param("now") java.time.LocalDateTime now,
            @Param("endOfDay") java.time.LocalDateTime endOfDay
    );
}