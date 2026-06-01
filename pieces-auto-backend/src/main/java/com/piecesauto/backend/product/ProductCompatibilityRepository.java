package com.piecesauto.backend.product;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductCompatibilityRepository extends JpaRepository<ProductCompatibility, Long> {

    List<ProductCompatibility> findByProductId(Long productId);

    List<ProductCompatibility> findByVehiculeVersionId(Long vehiculeVersionId);

    boolean existsByProductIdAndVehiculeVersionId(Long productId, Long vehiculeVersionId);
}