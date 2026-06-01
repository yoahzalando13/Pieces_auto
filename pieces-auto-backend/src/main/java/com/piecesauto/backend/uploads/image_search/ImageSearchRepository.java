package com.piecesauto.backend.uploads.image_search;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ImageSearchRepository extends JpaRepository<ImageSearch, Long> {

    List<ImageSearch> findByUserIdOrderByCreatedAtDesc(Long userId);
}