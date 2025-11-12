package com.backend.benxere.repository;

import com.backend.benxere.entity.Schedule;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public class CustomScheduleRepositoryImpl implements CustomScheduleRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<Schedule> findByRoute_OriginAndRoute_DestinationAndDepartureTimeBetween(String origin, String destination, LocalDateTime startDate, LocalDateTime endDate) {
        String jpql = "SELECT s FROM Schedule s WHERE s.route.origin = :origin AND s.route.destination = :destination AND s.departureTime BETWEEN :startDate AND :endDate";
        TypedQuery<Schedule> query = entityManager.createQuery(jpql, Schedule.class);
        query.setParameter("origin", origin);
        query.setParameter("destination", destination);
        query.setParameter("startDate", startDate);
        query.setParameter("endDate", endDate);
        return query.getResultList();
    }
}