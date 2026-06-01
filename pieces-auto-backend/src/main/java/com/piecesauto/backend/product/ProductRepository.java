package com.piecesauto.backend.product;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategoryId(Long categoryId);

    List<Product> findByNameContainingIgnoreCase(String keyword);

    boolean existsByReference(String reference);

    List<Product> findByShopId(Long shopId);

    List<Product> findByShopSellerUserId(Long userId);

    long countByShopId(Long shopId);

    long countByShopIdAndActiveTrue(Long shopId);

    List<Product> findTop10ByCategoryIdAndActiveTrueAndIdNot(Long categoryId, Long productId);

    List<Product> findTop10ByShopIdAndActiveTrueAndIdNot(Long shopId, Long productId);

    List<Product> findTop10ByActiveTrueOrderByIdDesc();

    @Query("""
            SELECT DISTINCT p
            FROM Product p
            LEFT JOIN ProductCompatibility pc ON pc.product = p
            LEFT JOIN pc.vehiculeVersion vv
            LEFT JOIN vv.model vm
            LEFT JOIN vm.brand vb
            WHERE p.active = true

            AND (
                :keyword IS NULL
                OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(p.reference) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(p.brandName) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )

            AND (
                :categoryId IS NULL
                OR p.category.id = :categoryId
            )

            AND (
                :shopId IS NULL
                OR p.shop.id = :shopId
            )

            AND (
                :vehiculeBrand IS NULL
                OR LOWER(vb.name) LIKE LOWER(CONCAT('%', :vehiculeBrand, '%'))
            )

            AND (
                :vehiculeModel IS NULL
                OR LOWER(vm.name) LIKE LOWER(CONCAT('%', :vehiculeModel, '%'))
            )

            AND (
                :year IS NULL
                OR (
                    vv.startYear <= :year
                    AND vv.endYear >= :year
                )
            )

            AND (
                :engine IS NULL
                OR LOWER(vv.engine) LIKE LOWER(CONCAT('%', :engine, '%'))
            )

            AND (
                :fuelType IS NULL
                OR LOWER(vv.fuelType) LIKE LOWER(CONCAT('%', :fuelType, '%'))
            )

            AND (
                :minPrice IS NULL
                OR p.normalPrice >= :minPrice
            )

            AND (
                :maxPrice IS NULL
                OR p.normalPrice <= :maxPrice
            )
            """)
    List<Product> searchAdvanced(
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
    );

    @Query("""
        SELECT DISTINCT p
        FROM Product p
        WHERE p.active = true

        AND (
            :keyword IS NULL
            OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(p.reference) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(p.brandName) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(p.imageSearchTags) LIKE LOWER(CONCAT('%', :keyword, '%'))
        )

        AND (
            :categoryId IS NULL
            OR p.category.id = :categoryId
        )
        """)
List<Product> searchByImageLabels(String keyword, Long categoryId);
    
}