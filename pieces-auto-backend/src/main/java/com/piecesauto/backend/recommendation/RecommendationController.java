package com.piecesauto.backend.recommendation;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.piecesauto.backend.recommendation.dto.RecommendedProductResponse;
import com.piecesauto.backend.user.User;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @PostMapping("/view/product/{productId}")
    public String recordProductView(
            Authentication authentication,
            @PathVariable Long productId
    ) {
        User user = (User) authentication.getPrincipal();

        recommendationService.recordProductView(user.getId(), productId);

        return "Vue produit enregistrée";
    }

    @GetMapping("/my")
    public List<RecommendedProductResponse> getMyRecommendations(Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        return recommendationService.getMyRecommendations(user.getId());
    }

    @GetMapping("/views/my")
    public List<ProductView> getMyProductViews(Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        return recommendationService.getMyProductViews(user.getId());
    }
}