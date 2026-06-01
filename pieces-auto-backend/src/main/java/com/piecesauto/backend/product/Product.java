package com.piecesauto.backend.product;

import com.piecesauto.backend.seller.Shop;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private BigDecimal normalPrice;

    private BigDecimal groupPrice;

    private Integer stock;

    private String imageUrl;

    private String reference;

    private String brandName;

    @Column(length = 1000)
    private String imageSearchTags;

    private boolean active = true;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private ProductCategory category;

    @ManyToOne
    @JoinColumn(name = "shop_id")
    private Shop shop;
}