package com.piecesauto.backend.embedding;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/product-embeddings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductImageEmbeddingController {

    private final ProductImageEmbeddingService embeddingService;

    @PostMapping("/product/{productId}")
    public ProductImageEmbedding generateEmbeddingForProduct(@PathVariable Long productId) {
        return embeddingService.generateEmbeddingForProduct(productId);
    }

    @PostMapping("/generate-missing")
    public String generateAllMissingEmbeddings() {
        int count = embeddingService.generateAllMissingEmbeddings();
        return count + " embeddings générés";
    }
}