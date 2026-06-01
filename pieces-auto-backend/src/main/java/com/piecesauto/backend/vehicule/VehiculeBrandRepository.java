package com.piecesauto.backend.vehicule;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface VehiculeBrandRepository extends JpaRepository<VehiculeBrand, Long> {

    Optional<VehiculeBrand> findByName(String name);

    boolean existsByName(String name);
}