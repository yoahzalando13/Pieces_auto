package com.piecesauto.backend.order;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    long countDistinctByProductShopId(Long shopId);

    @Query("""
            SELECT COUNT(DISTINCT oi.order.id)
            FROM OrderItem oi
            WHERE oi.product.shop.id = :shopId
            """)
    long countOrdersByShopId(Long shopId);

    @Query("""
            SELECT COALESCE(SUM(oi.totalPrice), 0)
            FROM OrderItem oi
            WHERE oi.product.shop.id = :shopId
            AND oi.order.status IN (
                com.piecesauto.backend.order.OrderStatus.PAID,
                com.piecesauto.backend.order.OrderStatus.PREPARING,
                com.piecesauto.backend.order.OrderStatus.SHIPPED,
                com.piecesauto.backend.order.OrderStatus.DELIVERED
            )
            """)
    BigDecimal calculateTotalSalesByShopId(Long shopId);
}