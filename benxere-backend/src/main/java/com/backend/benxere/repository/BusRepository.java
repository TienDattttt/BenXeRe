package com.backend.benxere.repository;

import com.backend.benxere.entity.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusRepository extends JpaRepository<Bus, Integer> {
    List<Bus> findByOwnerUserId(Integer ownerId);
    
    @Query("SELECT b FROM Bus b LEFT JOIN FETCH b.images WHERE b.busId = :id")
    Optional<Bus> findByIdWithImages(@Param("id") Integer id);
    
    @Query("SELECT b FROM Bus b LEFT JOIN FETCH b.images")
    List<Bus> findAllWithImages();
}