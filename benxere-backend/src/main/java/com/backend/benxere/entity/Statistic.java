package com.backend.benxere.entity;

import com.backend.benxere.entity.enums.EntityType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "statistics")
public class Statistic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stat_id")
    int statId;

    @Column(name = "entity_type", nullable = false)
    @Enumerated(EnumType.STRING)
    EntityType entityType;

    @Column(name = "entity_id", nullable = false)
    int entityId;

    @Column(name = "stat_date", nullable = false)
    Date statDate;

    @Column(name = "count", nullable = false)
    int count = 0;
}