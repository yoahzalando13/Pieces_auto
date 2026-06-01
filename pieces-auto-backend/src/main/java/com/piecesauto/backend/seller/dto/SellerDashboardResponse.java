package com.piecesauto.backend.seller.dto;

import java.math.BigDecimal;

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
public class SellerDashboardResponse {

    private Long sellerId;
    private Long shopId;
    private String shopName;

    private long totalProducts;
    private long activeProducts;
    private long totalOrders;

    private BigDecimal totalSales;
}