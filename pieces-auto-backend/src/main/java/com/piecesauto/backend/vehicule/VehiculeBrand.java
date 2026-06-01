package com.piecesauto.backend.vehicule;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vehicule_brands")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehiculeBrand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String country;

    private boolean active = true;
}