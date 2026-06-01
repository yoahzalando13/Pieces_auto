package com.piecesauto.backend.cart.dto;

import com.piecesauto.backend.cart.CartItem;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponse {

    private Long id;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;

    private Long productId;
    private String productName;
    private String productReference;
    private String productBrandName;
    private String productImageUrl;

    public static CartItemResponse fromEntity(CartItem item) {
        return CartItemResponse.builder()
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