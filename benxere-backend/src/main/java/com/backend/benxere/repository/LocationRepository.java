package com.backend.benxere.repository;

import com.backend.benxere.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationRepository extends JpaRepository<Location, Integer> {
    @Query("SELECT l FROM Location l WHERE l.name LIKE %:query%")
    List<Location> findByQuery(String query);
}
