package com.piecesauto.backend.recommendation;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductViewRepository extends JpaRepository<ProductView, Long> {

    List<ProductView> findTop20ByUserIdOrderByViewedAtDesc(Long userId);

    List<ProductView> findByUserIdOrderByViewedAtDesc(Long userId);

    boolean existsByUserIdAndProductId(Long userId, Long productId);
}