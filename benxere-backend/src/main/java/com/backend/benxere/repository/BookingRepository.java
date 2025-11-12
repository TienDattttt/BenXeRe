package com.backend.benxere.repository;


import com.backend.benxere.entity.Booking;
import com.backend.benxere.entity.User;
import com.backend.benxere.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    List<Booking> getBookingsByScheduleScheduleId(int scheduleId);
    List<Booking> getBookingsByUserEmail(String email);
    
    @Query("SELECT b FROM Booking b WHERE b.user = :user AND b.schedule = :schedule")
    List<Booking> findByUserAndSchedule(@Param("user") User user, @Param("schedule") Schedule schedule);
    
    @Query("SELECT b FROM Booking b WHERE b.temporary = true AND b.createdAt < :expirationTime")
    List<Booking> findExpiredTemporaryBookings(@Param("expirationTime") Timestamp expirationTime);
    
    List<Booking> findByStatusAndCreatedAtBefore(Booking.BookingStatus status, Timestamp timestamp);
    
    List<Booking> findByStatus(Booking.BookingStatus status);
    
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM booking_seats WHERE booking_id IN (SELECT booking_id FROM bookings WHERE status = 'Pending' AND created_at < :date)", nativeQuery = true)
    int deleteBookingSeatsForOldPendingBookings(@Param("date") Timestamp date);
    
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM bookings WHERE status = 'Pending' AND created_at < :date", nativeQuery = true)
    int deleteOldPendingBookings(@Param("date") Timestamp date);
    
    // Alternative methods using booking_date since created_at might be null
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM booking_seats WHERE booking_id IN (SELECT booking_id FROM bookings WHERE status = 'Pending' AND booking_date < :date)", nativeQuery = true)
    int deleteBookingSeatsForOldPendingBookingsByBookingDate(@Param("date") Timestamp date);
    
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM bookings WHERE status = 'Pending' AND booking_date < :date", nativeQuery = true)
    int deleteOldPendingBookingsByBookingDate(@Param("date") Timestamp date);

    List<Booking> findByScheduleAndStatus(Schedule schedule, Booking.BookingStatus status);

    // tìm booking có chứa seatId trong danh sách seats theo status
    List<Booking> findBySeats_SeatIdAndStatus(Integer seatId, Booking.BookingStatus status);
}
