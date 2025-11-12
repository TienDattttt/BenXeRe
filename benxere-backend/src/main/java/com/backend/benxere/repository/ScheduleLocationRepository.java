package com.backend.benxere.repository;

import com.backend.benxere.entity.ScheduleLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleLocationRepository extends JpaRepository<ScheduleLocation, Long> {
    List<ScheduleLocation> findByScheduleScheduleId(int scheduleId);
    
    @Query("SELECT sl FROM ScheduleLocation sl WHERE sl.schedule.scheduleId = :scheduleId AND sl.detail = :detail")
    List<ScheduleLocation> findByScheduleIdAndDetail(@Param("scheduleId") int scheduleId, @Param("detail") String detail);
    
    void deleteByScheduleScheduleId(int scheduleId);
}