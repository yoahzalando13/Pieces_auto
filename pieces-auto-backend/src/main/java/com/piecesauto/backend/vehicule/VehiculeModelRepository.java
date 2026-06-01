package com.piecesauto.backend.vehicule;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface VehiculeModelRepository extends JpaRepository<VehiculeModel, Long> {

    List<VehiculeModel> findByBrandId(Long brandId);

    boolean existsByNameAndBrandId(String name, Long brandId);
}