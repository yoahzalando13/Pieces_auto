package com.piecesauto.backend.vehicule;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface VehiculeVersionRepository extends JpaRepository<VehiculeVersion, Long> {

    List<VehiculeVersion> findByModelId(Long modelId);
}