package com.piecesauto.backend.uploads.image_search;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.piecesauto.backend.uploads.image_search.dto.ImageSearchResponse;
import com.piecesauto.backend.user.User;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/image-search")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ImageSearchController {

    private final ImageSearchService imageSearchService;

    @PostMapping("/upload")
    public ImageSearchResponse searchByImage(
            Authentication authentication,
            @RequestParam("image") MultipartFile image,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId
    ) {
        User user = (User) authentication.getPrincipal();

        return imageSearchService.searchByImage(
                user.getId(),
                image,
                keyword,
                categoryId
        );
    }

    @GetMapping("/my")
    public List<ImageSearchResponse> getMyImageSearches(Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        return imageSearchService.getMyImageSearches(user.getId());
    }
}