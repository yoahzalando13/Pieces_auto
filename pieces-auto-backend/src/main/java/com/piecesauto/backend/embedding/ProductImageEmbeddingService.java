package com.piecesauto.backend.embedding;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.piecesauto.backend.embedding.dto.AiEmbeddingResponse;
import com.piecesauto.backend.product.Product;
import com.piecesauto.backend.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.InputStream;
import java.net.URL;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductImageEmbeddingService {

    private final ProductImageEmbeddingRepository embeddingRepository;
    private final ProductRepository productRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.ai.image-embedding-url}")
    private String aiImageEmbeddingUrl;

    public ProductImageEmbedding generateEmbeddingForProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produit introuvable"));

        if (product.getImageUrl() == null || product.getImageUrl().isBlank()) {
            throw new RuntimeException("Ce produit n'a pas d'image");
        }

        List<Double> embedding = callAiEmbedding(product.getImageUrl());

        String embeddingJson = toJson(embedding);

        ProductImageEmbedding productEmbedding = embeddingRepository.findByProductId(productId)
                .orElse(
                        ProductImageEmbedding.builder()
                                .product(product)
                                .build()
                );

        productEmbedding.setImageUrl(product.getImageUrl());
        productEmbedding.setEmbeddingJson(embeddingJson);

        return embeddingRepository.save(productEmbedding);
    }

    public int generateAllMissingEmbeddings() {
        List<Product> products = productRepository.findAll()
                .stream()
                .filter(Product::isActive)
                .filter(product -> product.getImageUrl() != null && !product.getImageUrl().isBlank())
                .filter(product -> !embeddingRepository.existsByProductId(product.getId()))
                .toList();

        int count = 0;

        for (Product product : products) {
            try {
                generateEmbeddingForProduct(product.getId());
                count++;
            } catch (Exception ignored) {
                // On ignore les produits dont l'image n'est pas lisible.
            }
        }

        return count;
    }

    public int regenerateAllEmbeddings() {
        List<Product> products = productRepository.findAll()
                .stream()
                .filter(Product::isActive)
                .filter(product -> product.getImageUrl() != null && !product.getImageUrl().isBlank())
                .toList();

        int count = 0;

        for (Product product : products) {
            try {
                generateEmbeddingForProduct(product.getId());
                count++;
            } catch (Exception ignored) {
                // On ignore les produits dont l'image n'est pas lisible.
            }
        }

        return count;
    }

    public List<Product> findSimilarProducts(List<Double> queryEmbedding, int limit) {
        List<ProductImageEmbedding> embeddings = embeddingRepository.findByProductActiveTrue();

        return embeddings.stream()
                .map(item -> new SimilarProduct(
                        item.getProduct(),
                        cosineSimilarity(
                                queryEmbedding,
                                fromJson(item.getEmbeddingJson())
                        )
                ))
                .filter(item -> item.score >= 0.20)
                .sorted(Comparator.comparing(SimilarProduct::score).reversed())
                .limit(limit)
                .map(SimilarProduct::product)
                .toList();
    }

    public List<Double> createEmbeddingFromUploadedBytes(
            byte[] imageBytes,
            String fileName
    ) {
        try {
            ByteArrayResource imageResource = new ByteArrayResource(imageBytes) {
                @Override
                public String getFilename() {
                    return fileName != null ? fileName : "image.jpg";
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("image", imageResource);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity =
                    new HttpEntity<>(body, headers);

            ResponseEntity<AiEmbeddingResponse> response =
                    restTemplate.postForEntity(
                            aiImageEmbeddingUrl,
                            requestEntity,
                            AiEmbeddingResponse.class
                    );

            if (response.getBody() == null || response.getBody().getEmbedding() == null) {
                throw new RuntimeException("Embedding IA vide");
            }

            return response.getBody().getEmbedding();

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la création de l'embedding image");
        }
    }

    private List<Double> callAiEmbedding(String imageUrl) {
        try {
            byte[] imageBytes;

            try (InputStream inputStream = new URL(imageUrl).openStream()) {
                imageBytes = inputStream.readAllBytes();
            }

            return createEmbeddingFromUploadedBytes(
                    imageBytes,
                    "product-image.jpg"
            );

        } catch (Exception e) {
            throw new RuntimeException("Impossible de lire l'image du produit");
        }
    }

    private String toJson(List<Double> embedding) {
        try {
            return objectMapper.writeValueAsString(embedding);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Erreur conversion embedding JSON");
        }
    }

    private List<Double> fromJson(String embeddingJson) {
        try {
            return objectMapper.readValue(
                    embeddingJson,
                    new TypeReference<List<Double>>() {
                    }
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Erreur lecture embedding JSON");
        }
    }

    private double cosineSimilarity(List<Double> a, List<Double> b) {
        if (a == null || b == null || a.size() != b.size()) {
            return 0.0;
        }

        double dot = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < a.size(); i++) {
            dot += a.get(i) * b.get(i);
            normA += a.get(i) * a.get(i);
            normB += b.get(i) * b.get(i);
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private record SimilarProduct(Product product, double score) {
    }
}