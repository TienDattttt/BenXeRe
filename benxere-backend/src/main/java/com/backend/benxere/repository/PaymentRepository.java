package com.backend.benxere.repository;

import com.backend.benxere.entity.Payment;
import com.backend.benxere.entity.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    
    @Query("SELECT p FROM Payment p WHERE p.paymentStatus = 'PENDING' AND p.paymentDate < :timestamp")
    List<Payment> findPendingPaymentsOlderThan(@Param("timestamp") Timestamp timestamp);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM payments WHERE UPPER(payment_status) = 'PENDING' AND payment_date < :timestamp", nativeQuery = true)
    int deleteOldPendingPayments(@Param("timestamp") Timestamp timestamp);

    List<Payment> findByPaymentStatusAndPaymentDateBefore(PaymentStatus status, Timestamp timestamp);
    List<Payment> findByPaymentStatus(PaymentStatus status);
    
    @Query("SELECT p FROM Payment p WHERE p.paymentStatus = :status AND p.paymentDate < :timestamp ORDER BY p.paymentDate ASC")
    List<Payment> findPaymentsByStatusAndBeforeDate(@Param("status") PaymentStatus status, @Param("timestamp") Timestamp timestamp);
    
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.paymentStatus = :status AND p.paymentDate < :timestamp")
    long countPaymentsByStatusAndBeforeDate(@Param("status") PaymentStatus status, @Param("timestamp") Timestamp timestamp);
    
    Optional<Payment> findByTransId(String transId);
    boolean existsByTransId(String transId);
    
    /**
     * Find payment by related entity ID (e.g., booking ID)
     * Used primarily for retrieving payment information for email notifications
     */
    Optional<Payment> findByRelatedEntityId(Integer relatedEntityId);

    List<Payment> findByUser_UserId(Integer userId);

    @Query("SELECT p FROM Payment p JOIN Booking b ON p.relatedEntityId = b.bookingId AND p.entityType = 'BOOKING' JOIN b.schedule s JOIN s.bus bus WHERE bus.owner.userId = :ownerId")
    List<Payment> findByBusOwnerId(@Param("ownerId") Integer ownerId);

    @Query("SELECT COUNT(p) > 0 FROM Payment p WHERE p.relatedEntityId = :bookingId AND p.entityType = 'BOOKING' AND p.paymentStatus = 'COMPLETED'")
    boolean existsPaidBooking(@Param("bookingId") Integer bookingId);
}