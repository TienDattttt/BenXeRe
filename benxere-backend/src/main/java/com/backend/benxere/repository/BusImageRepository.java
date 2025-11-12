package com.backend.benxere.repository;

import com.backend.benxere.entity.BusImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusImageRepository extends JpaRepository<BusImage, Integer> {
    List<BusImage> findByBus_BusId(int busId);
    void deleteByBus_BusId(int busId);
}