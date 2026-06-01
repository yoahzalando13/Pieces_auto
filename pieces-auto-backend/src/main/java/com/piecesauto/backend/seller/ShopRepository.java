package com.piecesauto.backend.seller;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ShopRepository extends JpaRepository<Shop, Long> {

    Optional<Shop> findBySellerId(Long sellerId);

    Optional<Shop> findBySellerUserId(Long userId);

    boolean existsBySellerId(Long sellerId);

    boolean existsByShopName(String shopName);
}