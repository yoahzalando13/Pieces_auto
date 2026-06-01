package com.piecesauto.backend.vehicule;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vehicule_versions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehiculeVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer startYear;

    private Integer endYear;

    private String engine;

    private String fuelType;

    private String transmission;

    @ManyToOne
    @JoinColumn(name = "model_id", nullable = false)
    private VehiculeModel model;

    private boolean active = true;
}