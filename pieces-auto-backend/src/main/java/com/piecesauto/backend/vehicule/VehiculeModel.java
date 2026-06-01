package com.piecesauto.backend.vehicule;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vehicule_models")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehiculeModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String vehiculeType;

    @ManyToOne
    @JoinColumn(name = "brand_id", nullable = false)
    private VehiculeBrand brand;

    private boolean active = true;
}