package com.piecesauto.backend.uploads.image_search.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiImageAnalysisResponse {

    private String keyword;
    private List<DetectedLabel> labels;

    @Getter
    @Setter
    public static class DetectedLabel {
        private String labelEn;
        private String labelFr;
        private Double score;
    }
}