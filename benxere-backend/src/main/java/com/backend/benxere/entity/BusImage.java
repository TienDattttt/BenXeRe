package com.backend.benxere.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "bus_images")
public class BusImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id")
    int imageId;

    @Column(name = "image_name", nullable = false)
    String imageName;

    @Column(name = "image_url", nullable = false)
    String imageUrl;

    @Column(name = "image_type", nullable = false)
    String imageType;

    @ManyToOne
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;
}