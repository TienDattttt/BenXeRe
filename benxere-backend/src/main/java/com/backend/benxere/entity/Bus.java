package com.backend.benxere.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Timestamp;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "buses")
public class Bus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bus_id")
    int busId;

    @Column(name = "bus_number", unique = true, nullable = false)
    String busNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "bus_type", nullable = false)
    BusType busType;

    @Column(name = "capacity", nullable = false)
    int capacity;

    @Column(name = "company_name", nullable = false)
    String companyName;

    @ManyToOne
    @JoinColumn(name = "owner_id", referencedColumnName = "user_id", foreignKey = @ForeignKey(name = "FK_Bus_User"))
    User owner;

    @Column(name = "created_at", nullable = false, updatable = false)
    Timestamp createdAt;

    @OneToMany(mappedBy = "bus", cascade = CascadeType.ALL, orphanRemoval = true)
    List<BusImage> images;

    @OneToMany(mappedBy = "bus")
    List<Rating> ratings;

    public enum BusType {
        Sleeper, Seater, AC, Non_AC
    }
}