package com.piecesauto.backend.uploads.image_search.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.piecesauto.backend.product.dto.ProductResponse;
import com.piecesauto.backend.uploads.image_search.ImageSearch;

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
public class ImageSearchResponse {

    private Long id;

    private String originalFileName;

    private String imageUrl;

    private String keyword;

    private Long categoryId;

    private LocalDateTime createdAt;

    private String searchMode;

    private List<ProductResponse> suggestedProducts;

    public static ImageSearchResponse fromEntity(
            ImageSearch imageSearch,
            List<ProductResponse> suggestedProducts
    ) {
        return ImageSearchResponse.builder()
                .id(imageSearch.getId())
                .originalFileName(imageSearch.getOriginalFileName())
                .imageUrl(imageSearch.getImageUrl())
                .keyword(imageSearch.getKeyword())
                .categoryId(imageSearch.getCategoryId())
                .createdAt(imageSearch.getCreatedAt())
                .searchMode("LABELS")
                .suggestedProducts(suggestedProducts)
                .build();
    }

    public static ImageSearchResponse fromEntity(
            ImageSearch imageSearch,
            List<ProductResponse> suggestedProducts,
            String searchMode
    ) {
        return ImageSearchResponse.builder()
                .id(imageSearch.getId())
                .originalFileName(imageSearch.getOriginalFileName())
                .imageUrl(imageSearch.getImageUrl())
                .keyword(imageSearch.getKeyword())
                .categoryId(imageSearch.getCategoryId())
                .createdAt(imageSearch.getCreatedAt())
                .searchMode(searchMode)
                .suggestedProducts(suggestedProducts)
                .build();
    }
}