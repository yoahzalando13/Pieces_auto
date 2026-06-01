package com.piecesauto.backend.product;

import com.piecesauto.backend.product.dto.CreateCategoryRequest;
import com.piecesauto.backend.product.dto.CreateProductRequest;
import com.piecesauto.backend.product.dto.ProductResponse;
import com.piecesauto.backend.product.dto.SmartSearchResult;
import com.piecesauto.backend.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    // =========================
    // CATEGORY
    // =========================

    @PostMapping("/categories")
    public ProductCategory createCategory(
            @Valid @RequestBody CreateCategoryRequest request
    ) {
        return productService.createCategoryFromRequest(request);
    }

    @GetMapping("/categories")
    public List<ProductCategory> getAllCategories() {
        return productService.getAllCategories();
    }

    // =========================
    // PRODUCT ADMIN / GENERAL
    // =========================

    @PostMapping("/categories/{categoryId}")
    public ProductResponse createProduct(
            @PathVariable Long categoryId,
            @Valid @RequestBody CreateProductRequest request
    ) {
        return ProductResponse.fromEntity(
                productService.createProductFromRequest(categoryId, request)
        );
    }

    @GetMapping
    public List<ProductResponse> getAllProducts() {
        return productService.getAllProducts()
                .stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/category/{categoryId}")
    public List<ProductResponse> getProductsByCategory(@PathVariable Long categoryId) {
        return productService.getProductsByCategory(categoryId)
                .stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/search")
    public List<ProductResponse> searchProducts(@RequestParam String keyword) {
        return productService.searchProducts(keyword)
                .stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // =========================
    // SELLER PRODUCTS
    // =========================

    @PostMapping("/seller/categories/{categoryId}")
    public ProductResponse createSellerProduct(
            Authentication authentication,
            @PathVariable Long categoryId,
            @Valid @RequestBody CreateProductRequest request
    ) {
        User user = (User) authentication.getPrincipal();

        return ProductResponse.fromEntity(
                productService.createSellerProductFromRequest(
                        user.getId(),
                        categoryId,
                        request
                )
        );
    }

    @GetMapping("/seller/my")
    public List<ProductResponse> getMySellerProducts(Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        return productService.getMySellerProducts(user.getId())
                .stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/shop/{shopId}")
    public List<ProductResponse> getProductsByShop(@PathVariable Long shopId) {
        return productService.getProductsByShop(shopId)
                .stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // =========================
    // PRODUCT IMAGE UPLOAD
    // =========================

    @PostMapping("/{productId}/upload-image")
    public ProductResponse uploadProductImage(
            Authentication authentication,
            @PathVariable Long productId,
            @RequestParam("image") MultipartFile image
    ) {
        User user = (User) authentication.getPrincipal();

        return ProductResponse.fromEntity(
                productService.uploadProductImage(
                        user.getId(),
                        productId,
                        image
                )
        );
    }

    // =========================
    // IMAGE SEARCH TAGS
    // =========================

    @PutMapping("/{productId}/image-tags")
    public ProductResponse updateImageSearchTags(
            @PathVariable Long productId,
            @RequestParam String tags
    ) {
        return ProductResponse.fromEntity(
                productService.updateImageSearchTags(productId, tags)
        );
    }

    // =========================
    // COMPATIBILITY
    // =========================

    @PostMapping("/{productId}/compatibilities/{vehiculeVersionId}")
    public ProductCompatibility addCompatibility(
            @PathVariable Long productId,
            @PathVariable Long vehiculeVersionId,
            @RequestBody ProductCompatibility compatibility
    ) {
        return productService.addCompatibility(
                productId,
                vehiculeVersionId,
                compatibility
        );
    }

    @GetMapping("/{productId}/compatibilities")
    public List<ProductCompatibility> getCompatibilitiesByProduct(
            @PathVariable Long productId
    ) {
        return productService.getCompatibilitiesByProduct(productId);
    }

    @GetMapping("/compatible/vehicule-version/{vehiculeVersionId}")
    public List<ProductCompatibility> getCompatibleProductsByVehiculeVersion(
            @PathVariable Long vehiculeVersionId
    ) {
        return productService.getCompatibleProductsByVehiculeVersion(vehiculeVersionId);
    }

    // =========================
    // ADVANCED SEARCH
    // =========================

    @GetMapping("/search-advanced")
    public List<ProductResponse> searchAdvanced(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long shopId,
            @RequestParam(required = false) String vehiculeBrand,
            @RequestParam(required = false) String vehiculeModel,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String engine,
            @RequestParam(required = false) String fuelType,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        return productService.searchAdvanced(
                        keyword,
                        categoryId,
                        shopId,
                        vehiculeBrand,
                        vehiculeModel,
                        year,
                        engine,
                        fuelType,
                        minPrice,
                        maxPrice
                )
                .stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // =========================
    // SMART SEARCH
    // =========================

    @GetMapping("/smart-search")
    public List<ProductResponse> smartSearch(@RequestParam String q) {
        return productService.smartSearch(q)
                .stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/smart-search/parse")
    public SmartSearchResult parseSmartSearch(@RequestParam String q) {
        return productService.parseSmartSearch(q);
    }
}