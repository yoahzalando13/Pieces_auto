package com.piecesauto.backend.recommendation.dto;

import com.piecesauto.backend.product.Product;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendedProductResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal normalPrice;
    private BigDecimal groupPrice;
    private Integer stock;
    private String imageUrl;
    private String reference;
    private String brandName;

    private Long categoryId;
    private String categoryName;

    private Long shopId;
    private String shopName;

    private String reason;

    public static RecommendedProductResponse fromEntity(Product product, String reason) {
        return RecommendedProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .normalPrice(product.getNormalPrice())
                .groupPrice(product.getGroupPrice())
                .stock(product.getStock())
                .imageUrl(product.getImageUrl())
                .reference(product.getReference())
                .brandName(product.getBrandName())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .shopId(product.getShop() != null ? product.getShop().getId() : null)
                .shopName(product.getShop() != null ? product.getShop().getShopName() : null)
                .reason(reason)
                .build();
    }
}