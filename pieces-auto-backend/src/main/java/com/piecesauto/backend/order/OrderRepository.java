package com.piecesauto.backend.order;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Order> findByIdAndUserId(Long orderId, Long userId);

    boolean existsByOrderNumber(String orderNumber);

    boolean existsByUserIdAndStatusAndItemsProductId(
        Long userId,
        OrderStatus status,
        Long productId
);
}