package com.backend.benxere.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "promo_codes")
public class PromoCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "promo_id")
    int promoId;

    @Column(name = "code", nullable = false, unique = true)
    String code;

    @Column(name = "discount_percentage", nullable = false)
    double discountPercentage;

    @Column(name = "max_discount_amount", nullable = false)
    double maxDiscountAmount;

    @Column(name = "min_spend_amount", nullable = false)
    double minSpendAmount;

    @Column(name = "start_date", nullable = false)
    LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    LocalDateTime endDate;

    @ManyToOne
    @JoinColumn(name = "created_by", referencedColumnName = "user_id", foreignKey = @ForeignKey(name = "FK_PromoCode_User"))
    User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    Timestamp createdAt;
}