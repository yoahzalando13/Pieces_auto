package com.piecesauto.backend.embedding.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiEmbeddingResponse {

    private List<Double> embedding;
}