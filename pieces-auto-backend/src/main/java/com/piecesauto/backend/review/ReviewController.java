package com.piecesauto.backend.review;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.piecesauto.backend.review.dto.CreateReviewRequest;
import com.piecesauto.backend.review.dto.ReviewResponse;
import com.piecesauto.backend.user.User;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

   @PostMapping("/product/{productId}")
public ReviewResponse createReview(
        Authentication authentication,
        @PathVariable Long productId,
        @Valid @RequestBody CreateReviewRequest request
) {
    User user = (User) authentication.getPrincipal();

    return ReviewResponse.fromEntity(
            reviewService.createReviewFromRequest(user.getId(), productId, request)
    );
}

@GetMapping("/product/{productId}")
public List<ReviewResponse> getReviewsByProduct(@PathVariable Long productId) {
    return reviewService.getReviewsByProduct(productId)
            .stream()
            .map(ReviewResponse::fromEntity)
            .collect(Collectors.toList());
}

@GetMapping("/my")
public List<ReviewResponse> getMyReviews(Authentication authentication) {
    User user = (User) authentication.getPrincipal();

    return reviewService.getMyReviews(user.getId())
            .stream()
            .map(ReviewResponse::fromEntity)
            .collect(Collectors.toList());
}

@PutMapping("/my/{reviewId}")
public ReviewResponse updateMyReview(
        Authentication authentication,
        @PathVariable Long reviewId,
        @Valid @RequestBody CreateReviewRequest request
) {
    User user = (User) authentication.getPrincipal();

    return ReviewResponse.fromEntity(
            reviewService.updateMyReviewFromRequest(user.getId(), reviewId, request)
    );
}

@DeleteMapping("/my/{reviewId}")
public void deleteMyReview(
        Authentication authentication,
        @PathVariable Long reviewId
) {
    User user = (User) authentication.getPrincipal();

    reviewService.deleteMyReview(user.getId(), reviewId);
}

@GetMapping("/admin")
public List<ReviewResponse> getAllReviews() {
    return reviewService.getAllReviews()
            .stream()
            .map(ReviewResponse::fromEntity)
            .collect(Collectors.toList());
}
}