package com.piecesauto.backend.uploads.image_search.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiImageSimilarityResponse {

    private List<SimilarityResult> results;

    @Getter
    @Setter
    public static class SimilarityResult {
        private Long productId;
        private Double score;
    }
}