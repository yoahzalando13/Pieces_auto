package com.piecesauto.backend.review.dto;

import java.time.LocalDateTime;

import com.piecesauto.backend.review.Review;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {

    private Long id;
    private Integer rating;
    private String comment;
    private String imageUrl;
    private LocalDateTime createdAt;
    private boolean active;

    private Long productId;
    private String productName;

    private Long userId;
    private String userName;

    public static ReviewResponse fromEntity(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .imageUrl(review.getImageUrl())
                .createdAt(review.getCreatedAt())
                .active(review.isActive())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .userId(review.getUser().getId())
                .userName(review.getUser().getNom() + " " + review.getUser().getPrenom())
                .build();
    }
}