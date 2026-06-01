package com.piecesauto.backend.delivery;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    Optional<Delivery> findByOrderId(Long orderId);

    Optional<Delivery> findByIdAndUserId(Long deliveryId, Long userId);

    List<Delivery> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByOrderId(Long orderId);

    boolean existsByDeliveryNumber(String deliveryNumber);
}