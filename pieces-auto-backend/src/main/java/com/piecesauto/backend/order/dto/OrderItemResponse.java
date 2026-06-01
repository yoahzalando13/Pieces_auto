package com.piecesauto.backend.order.dto;

import java.math.BigDecimal;

import com.piecesauto.backend.order.OrderItem;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {

    private Long id;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;

    private Long productId;
    private String productName;
    private String productReference;
    private String productBrandName;
    private String productImageUrl;

    public static OrderItemResponse fromEntity(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productReference(item.getProduct().getReference())
                .productBrandName(item.getProduct().getBrandName())
                .productImageUrl(item.getProduct().getImageUrl())
                .build();
    }
}