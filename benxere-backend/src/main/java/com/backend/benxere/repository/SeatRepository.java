package com.backend.benxere.repository;

import com.backend.benxere.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Integer> {
    List<Seat> findAllByScheduleScheduleId(int scheduleId);
  
}