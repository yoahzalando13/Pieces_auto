package com.piecesauto.backend.product.dto;

import java.math.BigDecimal;

import com.piecesauto.backend.product.Product;

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
public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal normalPrice;
    private BigDecimal groupPrice;
    private Integer stock;
    private String imageUrl;
    private String reference;
    private String brandName;
    private boolean active;

    private Long categoryId;
    private String categoryName;

    private Long shopId;
    private String shopName;

    private String imageSearchTags;

    public static ProductResponse fromEntity(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .normalPrice(product.getNormalPrice())
                .groupPrice(product.getGroupPrice())
                .stock(product.getStock())
                .imageUrl(product.getImageUrl())
                .reference(product.getReference())
                .brandName(product.getBrandName())
                .active(product.isActive())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .shopId(product.getShop() != null ? product.getShop().getId() : null)
                .shopName(product.getShop() != null ? product.getShop().getShopName() : null)
                .imageSearchTags(product.getImageSearchTags())
                .build();
    }
}