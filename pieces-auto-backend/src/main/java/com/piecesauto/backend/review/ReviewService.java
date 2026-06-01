package com.piecesauto.backend.review;

import java.util.List;

import org.springframework.stereotype.Service;

import com.piecesauto.backend.order.OrderRepository;
import com.piecesauto.backend.order.OrderStatus;
import com.piecesauto.backend.product.Product;
import com.piecesauto.backend.product.ProductRepository;
import com.piecesauto.backend.review.dto.CreateReviewRequest;
import com.piecesauto.backend.user.User;
import com.piecesauto.backend.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public Review createReview(
            Long userId,
            Long productId,
            Review review
    ) {
        if (review.getRating() == null || review.getRating() < 1 || review.getRating() > 5) {
            throw new RuntimeException("La note doit être comprise entre 1 et 5");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produit introuvable"));

        boolean hasDeliveredOrder = orderRepository.existsByUserIdAndStatusAndItemsProductId(
                userId,
                OrderStatus.DELIVERED,
                productId
        );

        if (!hasDeliveredOrder) {
            throw new RuntimeException("Vous devez avoir reçu ce produit avant de laisser un avis");
        }

        if (reviewRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new RuntimeException("Vous avez déjà laissé un avis sur ce produit");
        }

        review.setUser(user);
        review.setProduct(product);
        review.setActive(true);

        return reviewRepository.save(review);
    }

    public List<Review> getReviewsByProduct(Long productId) {
        return reviewRepository.findByProductIdAndActiveTrueOrderByCreatedAtDesc(productId);
    }

    public List<Review> getMyReviews(Long userId) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Review updateMyReview(
            Long userId,
            Long reviewId,
            Review newReview
    ) {
        Review review = reviewRepository.findByIdAndUserId(reviewId, userId)
                .orElseThrow(() -> new RuntimeException("Avis introuvable"));

        if (newReview.getRating() == null || newReview.getRating() < 1 || newReview.getRating() > 5) {
            throw new RuntimeException("La note doit être comprise entre 1 et 5");
        }

        review.setRating(newReview.getRating());
        review.setComment(newReview.getComment());
        review.setImageUrl(newReview.getImageUrl());

        return reviewRepository.save(review);
    }

    public void deleteMyReview(Long userId, Long reviewId) {
        Review review = reviewRepository.findByIdAndUserId(reviewId, userId)
                .orElseThrow(() -> new RuntimeException("Avis introuvable"));

        review.setActive(false);
        reviewRepository.save(review);
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public Review createReviewFromRequest(
        Long userId,
        Long productId,
        CreateReviewRequest request
) {
    Review review = Review.builder()
            .rating(request.getRating())
            .comment(request.getComment())
            .imageUrl(request.getImageUrl())
            .active(true)
            .build();

    return createReview(userId, productId, review);
}

public Review updateMyReviewFromRequest(
        Long userId,
        Long reviewId,
        CreateReviewRequest request
) {
    Review review = Review.builder()
            .rating(request.getRating())
            .comment(request.getComment())
            .imageUrl(request.getImageUrl())
            .build();

    return updateMyReview(userId, reviewId, review);
}
}