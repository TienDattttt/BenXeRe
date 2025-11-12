package com.backend.benxere.entity;

import com.backend.benxere.entity.enums.PaymentMethod;
import com.backend.benxere.entity.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.Data;
import java.sql.Timestamp;

@Entity
@Table(name = "payments")
@Data
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer paymentId;

    private Long amount;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", columnDefinition = "varchar(255) check (payment_status in ('PENDING','COMPLETED','FAILED','REFUNDED'))")
    private PaymentStatus paymentStatus;

    private String transId;

    private Timestamp paymentDate;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String entityType;
    
    private Integer relatedEntityId;
}