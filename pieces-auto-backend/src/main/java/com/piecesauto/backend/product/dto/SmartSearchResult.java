package com.piecesauto.backend.product.dto;

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
public class SmartSearchResult {

    private String keyword;
    private String vehiculeBrand;
    private String vehiculeModel;
    private Integer year;
    private String engine;
    private String fuelType;
}