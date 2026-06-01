package com.piecesauto.backend.seller.dto;

import java.time.LocalDateTime;

import com.piecesauto.backend.seller.SellerStatus;
import com.piecesauto.backend.seller.Shop;

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
public class ShopResponse {

    private Long shopId;
    private String shopName;
    private String description;
    private String phone;
    private String address;
    private String logoUrl;
    private boolean active;
    private LocalDateTime createdAt;

    private Long sellerId;
    private SellerStatus sellerStatus;

    private Long userId;
    private String sellerName;

    public static ShopResponse fromEntity(Shop shop) {
        return ShopResponse.builder()
                .shopId(shop.getId())
                .shopName(shop.getShopName())
                .description(shop.getDescription())
                .phone(shop.getPhone())
                .address(shop.getAddress())
                .logoUrl(shop.getLogoUrl())
                .active(shop.isActive())
                .createdAt(shop.getCreatedAt())
                .sellerId(shop.getSeller().getId())
                .sellerStatus(shop.getSeller().getStatus())
                .userId(shop.getSeller().getUser().getId())
                .sellerName(shop.getSeller().getUser().getNom() + " " + shop.getSeller().getUser().getPrenom())
                .build();
    }
}