package com.piecesauto.backend.uploads.image_search;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.piecesauto.backend.embedding.ProductImageEmbeddingService;
import com.piecesauto.backend.product.Product;
import com.piecesauto.backend.product.ProductRepository;
import com.piecesauto.backend.product.dto.ProductResponse;
import com.piecesauto.backend.uploads.image_search.dto.AiImageAnalysisResponse;
import com.piecesauto.backend.uploads.image_search.dto.ImageSearchResponse;
import com.piecesauto.backend.user.User;
import com.piecesauto.backend.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ImageSearchService {

    private final ImageSearchRepository imageSearchRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductImageEmbeddingService productImageEmbeddingService;

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.upload.image-search-dir}")
    private String uploadDir;

    @Value("${app.ai.image-service-url}")
    private String aiImageServiceUrl;

    public ImageSearchResponse searchByImage(
            Long userId,
            MultipartFile image,
            String keyword,
            Long categoryId
    ) {
        if (image == null || image.isEmpty()) {
            throw new RuntimeException("L'image est obligatoire");
        }

        validateImage(image);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        String cleanedKeyword = clean(keyword);

        String searchMode = "LABELS";

        List<Product> products;

        if (cleanedKeyword == null && categoryId == null) {
            products = searchSimilarProductsWithStoredEmbeddings(image);
            searchMode = "STORED_EMBEDDING_SIMILARITY";

            if (products.isEmpty()) {
                cleanedKeyword = analyzeImageWithAi(image);
                products = findSuggestedProducts(cleanedKeyword, categoryId);
                searchMode = "AI_LABELS";
            }
        } else {
            products = findSuggestedProducts(cleanedKeyword, categoryId);
        }

        String storedFileName = storeImage(image);

        String imageUrl = "/uploads/image-search/" + storedFileName;

        ImageSearch imageSearch = ImageSearch.builder()
                .user(user)
                .originalFileName(image.getOriginalFilename())
                .storedFileName(storedFileName)
                .imageUrl(imageUrl)
                .keyword(cleanedKeyword)
                .categoryId(categoryId)
                .build();

        ImageSearch savedSearch = imageSearchRepository.save(imageSearch);

        List<ProductResponse> responses = products.stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());

        return ImageSearchResponse.fromEntity(savedSearch, responses, searchMode);
    }

    public List<ImageSearchResponse> getMyImageSearches(Long userId) {
        return imageSearchRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(search -> ImageSearchResponse.fromEntity(search, List.of(), "HISTORY"))
                .collect(Collectors.toList());
    }

    private List<Product> searchSimilarProductsWithStoredEmbeddings(MultipartFile image) {
        try {
            List<Double> queryEmbedding =
                    productImageEmbeddingService.createEmbeddingFromUploadedBytes(
                            image.getBytes(),
                            image.getOriginalFilename()
                    );

            return productImageEmbeddingService.findSimilarProducts(queryEmbedding, 10);

        } catch (Exception e) {
            return List.of();
        }
    }

    private List<Product> findSuggestedProducts(String keyword, Long categoryId) {
        String cleanedKeyword = clean(keyword);

        if (cleanedKeyword != null || categoryId != null) {
            return productRepository.searchByImageLabels(cleanedKeyword, categoryId);
        }

        return productRepository.findTop10ByActiveTrueOrderByIdDesc();
    }

    private String storeImage(MultipartFile image) {
        try {
            Path uploadPath = Paths.get(uploadDir);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFileName = image.getOriginalFilename();
            String extension = getFileExtension(originalFileName);

            String storedFileName = UUID.randomUUID() + extension;

            Path filePath = uploadPath.resolve(storedFileName);

            Files.copy(
                    image.getInputStream(),
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            return storedFileName;

        } catch (IOException e) {
            throw new RuntimeException("Erreur lors du stockage de l'image");
        }
    }

    private void validateImage(MultipartFile image) {
        String contentType = image.getContentType();

        if (contentType == null) {
            throw new RuntimeException("Type de fichier invalide");
        }

        if (!contentType.equals("image/jpeg")
                && !contentType.equals("image/png")
                && !contentType.equals("image/webp")) {
            throw new RuntimeException("Seuls les formats JPG, PNG et WEBP sont acceptés");
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return ".jpg";
        }

        String extension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();

        if (!extension.equals(".jpg")
                && !extension.equals(".jpeg")
                && !extension.equals(".png")
                && !extension.equals(".webp")) {
            return ".jpg";
        }

        return extension;
    }

    private String analyzeImageWithAi(MultipartFile image) {
        try {
            ByteArrayResource imageResource = new ByteArrayResource(image.getBytes()) {
                @Override
                public String getFilename() {
                    return image.getOriginalFilename();
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("image", imageResource);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity =
                    new HttpEntity<>(body, headers);

            ResponseEntity<AiImageAnalysisResponse> response =
                    restTemplate.postForEntity(
                            aiImageServiceUrl,
                            requestEntity,
                            AiImageAnalysisResponse.class
                    );

            if (response.getBody() == null) {
                return null;
            }

            return clean(response.getBody().getKeyword());

        } catch (Exception e) {
            return null;
        }
    }

    private String clean(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}