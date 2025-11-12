package com.backend.benxere.repository;

import com.backend.benxere.entity.Rating;
import com.backend.benxere.entity.Schedule;
import com.backend.benxere.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Integer> {
    // Basic operations
    Optional<Rating> findByRatingIdAndUser(int ratingId, User user);
    List<Rating> findByUser(User user);
    List<Rating> findBySchedule(Schedule schedule);
    List<Rating> findByScheduleScheduleId(int scheduleId);

    Page<Rating> findByScheduleBusCompanyName(String companyName, Pageable pageable);
    long countByScheduleBusCompanyName(String companyName);
    
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Rating r WHERE r.schedule.bus.companyName = :companyName")
    double getAverageRatingByCompanyName(@Param("companyName") String companyName);

    Page<Rating> findByScheduleBusBusId(Integer busId, Pageable pageable);
    long countByScheduleBusBusId(Integer busId);
    
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Rating r WHERE r.schedule.bus.busId = :busId")
    double getAverageRatingByBusId(@Param("busId") Integer busId);

    Page<Rating> findByScheduleBusOwnerUserId(Integer ownerId, Pageable pageable);
    long countByScheduleBusOwnerUserId(Integer ownerId);
    
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Rating r WHERE r.schedule.bus.owner.userId = :ownerId")
    double getAverageRatingByBusOwnerId(@Param("ownerId") Integer ownerId);

    boolean existsByScheduleBusCompanyName(String companyName);
    boolean existsByScheduleBusBusId(Integer busId);
    boolean existsByScheduleBusOwnerUserId(Integer ownerId);

    @Query("SELECT DISTINCT r.schedule.bus.companyName FROM Rating r WHERE r.schedule.bus.companyName IS NOT NULL")
    Set<String> findAllUniqueCompanyNames();
}
