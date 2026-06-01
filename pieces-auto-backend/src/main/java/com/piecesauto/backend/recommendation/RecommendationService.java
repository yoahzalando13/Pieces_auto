package com.piecesauto.backend.recommendation;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.piecesauto.backend.product.Product;
import com.piecesauto.backend.product.ProductRepository;
import com.piecesauto.backend.recommendation.dto.RecommendedProductResponse;
import com.piecesauto.backend.user.User;
import com.piecesauto.backend.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final ProductViewRepository productViewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public void recordProductView(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produit introuvable"));

        ProductView view = ProductView.builder()
                .user(user)
                .product(product)
                .build();

        productViewRepository.save(view);
    }

    public List<RecommendedProductResponse> getMyRecommendations(Long userId) {
        List<ProductView> recentViews = productViewRepository.findTop20ByUserIdOrderByViewedAtDesc(userId);

        if (recentViews.isEmpty()) {
            return getDefaultRecommendations();
        }

        Map<Long, RecommendedProductResponse> recommendations = new LinkedHashMap<>();

        for (ProductView view : recentViews) {
            Product viewedProduct = view.getProduct();

            addCategoryRecommendations(recommendations, viewedProduct);
            addShopRecommendations(recommendations, viewedProduct);

            if (recommendations.size() >= 20) {
                break;
            }
        }

        if (recommendations.isEmpty()) {
            return getDefaultRecommendations();
        }

        return recommendations.values()
                .stream()
                .limit(20)
                .toList();
    }

    public List<ProductView> getMyProductViews(Long userId) {
        return productViewRepository.findByUserIdOrderByViewedAtDesc(userId);
    }

    private void addCategoryRecommendations(
            Map<Long, RecommendedProductResponse> recommendations,
            Product viewedProduct
    ) {
        if (viewedProduct.getCategory() == null) {
            return;
        }

        List<Product> products = productRepository.findTop10ByCategoryIdAndActiveTrueAndIdNot(
                viewedProduct.getCategory().getId(),
                viewedProduct.getId()
        );

        for (Product product : products) {
            recommendations.putIfAbsent(
                    product.getId(),
                    RecommendedProductResponse.fromEntity(
                            product,
                            "Même catégorie que " + viewedProduct.getName()
                    )
            );
        }
    }

    private void addShopRecommendations(
            Map<Long, RecommendedProductResponse> recommendations,
            Product viewedProduct
    ) {
        if (viewedProduct.getShop() == null) {
            return;
        }

        List<Product> products = productRepository.findTop10ByShopIdAndActiveTrueAndIdNot(
                viewedProduct.getShop().getId(),
                viewedProduct.getId()
        );

        for (Product product : products) {
            recommendations.putIfAbsent(
                    product.getId(),
                    RecommendedProductResponse.fromEntity(
                            product,
                            "Même boutique que " + viewedProduct.getName()
                    )
            );
        }
    }

    private List<RecommendedProductResponse> getDefaultRecommendations() {
        return productRepository.findTop10ByActiveTrueOrderByIdDesc()
                .stream()
                .map(product -> RecommendedProductResponse.fromEntity(
                        product,
                        "Produit récemment ajouté"
                ))
                .toList();
    }
}