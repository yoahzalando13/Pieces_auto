package com.piecesauto.backend.product;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.piecesauto.backend.embedding.ProductImageEmbeddingService;
import com.piecesauto.backend.product.dto.CreateCategoryRequest;
import com.piecesauto.backend.product.dto.CreateProductRequest;
import com.piecesauto.backend.product.dto.SmartSearchResult;
import com.piecesauto.backend.seller.SellerStatus;
import com.piecesauto.backend.seller.Shop;
import com.piecesauto.backend.seller.ShopRepository;
import com.piecesauto.backend.user.Role;
import com.piecesauto.backend.user.User;
import com.piecesauto.backend.user.UserRepository;
import com.piecesauto.backend.vehicule.VehiculeBrandRepository;
import com.piecesauto.backend.vehicule.VehiculeModelRepository;
import com.piecesauto.backend.vehicule.VehiculeVersion;
import com.piecesauto.backend.vehicule.VehiculeVersionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductCategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductCompatibilityRepository compatibilityRepository;
    private final VehiculeVersionRepository vehiculeVersionRepository;
    private final VehiculeBrandRepository vehiculeBrandRepository;
    private final VehiculeModelRepository vehiculeModelRepository;
    private final ShopRepository shopRepository;
    private final UserRepository userRepository;
    private final ProductImageEmbeddingService productImageEmbeddingService;

    @Value("${app.upload.product-dir}")
    private String productUploadDir;

    @Value("${app.base-url}")
    private String baseUrl;

    // =========================
    // CATEGORY
    // =========================

    public ProductCategory createCategory(ProductCategory category) {
        if (categoryRepository.existsByName(category.getName())) {
            throw new RuntimeException("Cette catégorie existe déjà");
        }

        category.setActive(true);
        return categoryRepository.save(category);
    }

    public ProductCategory createCategoryFromRequest(CreateCategoryRequest request) {
        ProductCategory category = ProductCategory.builder()
                .name(request.getName())
                .description(request.getDescription())
                .active(true)
                .build();

        return createCategory(category);
    }

    public List<ProductCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    // =========================
    // PRODUCT CREATE
    // =========================

    public Product createProduct(Long categoryId, Product product) {
        ProductCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Catégorie introuvable"));

        if (product.getReference() != null && !product.getReference().isBlank()) {
            if (productRepository.existsByReference(product.getReference())) {
                throw new RuntimeException("Cette référence produit existe déjà");
            }
        }

        product.setCategory(category);
        product.setActive(true);

        return productRepository.save(product);
    }

    public Product createProductFromRequest(Long categoryId, CreateProductRequest request) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .normalPrice(request.getNormalPrice())
                .groupPrice(request.getGroupPrice())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .reference(request.getReference())
                .brandName(request.getBrandName())
                .imageSearchTags(request.getImageSearchTags())
                .active(true)
                .build();

        return createProduct(categoryId, product);
    }

    public Product createSellerProductFromRequest(
            Long userId,
            Long categoryId,
            CreateProductRequest request
    ) {
        Shop shop = shopRepository.findBySellerUserId(userId)
                .orElseThrow(() -> new RuntimeException("Boutique vendeur introuvable"));

        if (shop.getSeller().getStatus() != SellerStatus.APPROVED) {
            throw new RuntimeException("Votre compte vendeur doit être validé par l'admin avant d'ajouter des produits");
        }

        if (!shop.isActive()) {
            throw new RuntimeException("Votre boutique est désactivée");
        }

        ProductCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Catégorie introuvable"));

        if (request.getReference() != null && !request.getReference().isBlank()) {
            if (productRepository.existsByReference(request.getReference())) {
                throw new RuntimeException("Cette référence produit existe déjà");
            }
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .normalPrice(request.getNormalPrice())
                .groupPrice(request.getGroupPrice())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .reference(request.getReference())
                .brandName(request.getBrandName())
                .imageSearchTags(request.getImageSearchTags())
                .category(category)
                .shop(shop)
                .active(true)
                .build();

        return productRepository.save(product);
    }

    // =========================
    // PRODUCT IMAGE UPLOAD
    // =========================

    public Product uploadProductImage(
            Long userId,
            Long productId,
            MultipartFile image
    ) {
        if (image == null || image.isEmpty()) {
            throw new RuntimeException("L'image est obligatoire");
        }

        validateProductImage(image);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produit introuvable"));

        if (user.getRole() != Role.ADMIN && user.getRole() != Role.VENDEUR) {
            throw new RuntimeException("Seul un admin ou un vendeur peut uploader une image produit");
        }

        if (user.getRole() == Role.VENDEUR) {
            if (product.getShop() == null) {
                throw new RuntimeException("Ce produit n'appartient à aucune boutique");
            }

            Long ownerUserId = product.getShop()
                    .getSeller()
                    .getUser()
                    .getId();

            if (!ownerUserId.equals(userId)) {
                throw new RuntimeException("Vous ne pouvez modifier que les produits de votre boutique");
            }
        }

        String storedFileName = storeProductImage(image);

        String imageUrl = baseUrl + "/uploads/products/" + storedFileName;

        product.setImageUrl(imageUrl);

        Product savedProduct = productRepository.save(product);

        try {
            productImageEmbeddingService.generateEmbeddingForProduct(savedProduct.getId());
        } catch (Exception e) {
            // Ne bloque pas l'upload si le service IA Python est arrêté.
            // L'embedding pourra être généré plus tard par l'admin.
        }

        return savedProduct;
    }

    private String storeProductImage(MultipartFile image) {
        try {
            Path uploadPath = Paths.get(productUploadDir);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFileName = image.getOriginalFilename();
            String extension = getProductImageExtension(originalFileName);

            String storedFileName = UUID.randomUUID() + extension;

            Path filePath = uploadPath.resolve(storedFileName);

            Files.copy(
                    image.getInputStream(),
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            return storedFileName;

        } catch (IOException e) {
            throw new RuntimeException("Erreur lors du stockage de l'image produit");
        }
    }

    private void validateProductImage(MultipartFile image) {
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

    private String getProductImageExtension(String fileName) {
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

    // =========================
    // IMAGE SEARCH TAGS
    // =========================

    public Product updateImageSearchTags(Long productId, String imageSearchTags) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produit introuvable"));

        product.setImageSearchTags(imageSearchTags);

        return productRepository.save(product);
    }

    // =========================
    // READ PRODUCTS
    // =========================

    public Product getProductById(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produit introuvable"));
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public List<Product> searchProducts(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword);
    }

    public List<Product> getMySellerProducts(Long userId) {
        return productRepository.findByShopSellerUserId(userId);
    }

    public List<Product> getProductsByShop(Long shopId) {
        return productRepository.findByShopId(shopId);
    }

    // =========================
    // COMPATIBILITY
    // =========================

    public ProductCompatibility addCompatibility(
            Long productId,
            Long vehiculeVersionId,
            ProductCompatibility compatibility
    ) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produit introuvable"));

        VehiculeVersion vehiculeVersion = vehiculeVersionRepository.findById(vehiculeVersionId)
                .orElseThrow(() -> new RuntimeException("Version véhicule introuvable"));

        if (compatibilityRepository.existsByProductIdAndVehiculeVersionId(productId, vehiculeVersionId)) {
            throw new RuntimeException("Cette compatibilité existe déjà");
        }

        compatibility.setProduct(product);
        compatibility.setVehiculeVersion(vehiculeVersion);

        return compatibilityRepository.save(compatibility);
    }

    public List<ProductCompatibility> getCompatibilitiesByProduct(Long productId) {
        return compatibilityRepository.findByProductId(productId);
    }

    public List<ProductCompatibility> getCompatibleProductsByVehiculeVersion(Long vehiculeVersionId) {
        return compatibilityRepository.findByVehiculeVersionId(vehiculeVersionId);
    }

    // =========================
    // ADVANCED SEARCH
    // =========================

    public List<Product> searchAdvanced(
            String keyword,
            Long categoryId,
            Long shopId,
            String vehiculeBrand,
            String vehiculeModel,
            Integer year,
            String engine,
            String fuelType,
            BigDecimal minPrice,
            BigDecimal maxPrice
    ) {
        keyword = clean(keyword);
        vehiculeBrand = clean(vehiculeBrand);
        vehiculeModel = clean(vehiculeModel);
        engine = clean(engine);
        fuelType = clean(fuelType);

        return productRepository.searchAdvanced(
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
        );
    }

    // =========================
    // SMART SEARCH
    // =========================

    public List<Product> smartSearch(String query) {
        SmartSearchResult parsed = parseSmartSearch(query);

        return searchAdvanced(
                parsed.getKeyword(),
                null,
                null,
                parsed.getVehiculeBrand(),
                parsed.getVehiculeModel(),
                parsed.getYear(),
                parsed.getEngine(),
                parsed.getFuelType(),
                null,
                null
        );
    }

    public SmartSearchResult parseSmartSearch(String query) {
        if (query == null || query.isBlank()) {
            return SmartSearchResult.builder()
                    .keyword(null)
                    .build();
        }

        String cleanedQuery = query.trim().toLowerCase();

        Integer year = extractYear(cleanedQuery);
        String fuelType = extractFuelType(cleanedQuery);
        String engine = extractEngine(cleanedQuery);
        String vehiculeBrand = extractVehiculeBrand(cleanedQuery);
        String vehiculeModel = extractVehiculeModel(cleanedQuery);

        String keyword = cleanedQuery;

        if (year != null) {
            keyword = keyword.replace(String.valueOf(year), "");
        }

        if (fuelType != null) {
            keyword = removeFuelWords(keyword);
        }

        if (engine != null) {
            keyword = keyword.replace(engine.toLowerCase(), "");
        }

        if (vehiculeBrand != null) {
            keyword = keyword.replace(vehiculeBrand.toLowerCase(), "");
        }

        if (vehiculeModel != null) {
            keyword = keyword.replace(vehiculeModel.toLowerCase(), "");
        }

        keyword = keyword.replaceAll("\\s+", " ").trim();

        if (keyword.isBlank()) {
            keyword = null;
        }

        return SmartSearchResult.builder()
                .keyword(keyword)
                .vehiculeBrand(vehiculeBrand)
                .vehiculeModel(vehiculeModel)
                .year(year)
                .engine(engine)
                .fuelType(fuelType)
                .build();
    }

    private Integer extractYear(String query) {
        String[] words = query.split("\\s+");

        for (String word : words) {
            if (word.matches("^(19|20)\\d{2}$")) {
                return Integer.parseInt(word);
            }
        }

        return null;
    }

    private String extractFuelType(String query) {
        if (query.contains("essence") || query.contains("gasoline")) {
            return "ESSENCE";
        }

        if (query.contains("diesel") || query.contains("gasoil")) {
            return "DIESEL";
        }

        if (query.contains("hybride") || query.contains("hybrid")) {
            return "HYBRIDE";
        }

        if (query.contains("electrique")
                || query.contains("électrique")
                || query.contains("electric")) {
            return "ELECTRIQUE";
        }

        return null;
    }

    private String removeFuelWords(String keyword) {
        return keyword
                .replace("essence", "")
                .replace("gasoline", "")
                .replace("diesel", "")
                .replace("gasoil", "")
                .replace("hybride", "")
                .replace("hybrid", "")
                .replace("electrique", "")
                .replace("électrique", "")
                .replace("electric", "");
    }

    private String extractEngine(String query) {
        String[] words = query.split("\\s+");

        for (String word : words) {
            if (word.matches("^\\d+(\\.\\d+)?$")) {
                return word;
            }

            if (word.matches("^\\d+(\\.\\d+)?l$")) {
                return word.replace("l", "");
            }

            if (word.matches("^\\d+(\\.\\d+)?cc$")) {
                return word.replace("cc", "");
            }
        }

        return null;
    }

    private String extractVehiculeBrand(String query) {
        return vehiculeBrandRepository.findAll()
                .stream()
                .filter(brand -> query.contains(brand.getName().toLowerCase()))
                .map(brand -> brand.getName())
                .findFirst()
                .orElse(null);
    }

    private String extractVehiculeModel(String query) {
        return vehiculeModelRepository.findAll()
                .stream()
                .filter(model -> query.contains(model.getName().toLowerCase()))
                .map(model -> model.getName())
                .findFirst()
                .orElse(null);
    }

    private String clean(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}