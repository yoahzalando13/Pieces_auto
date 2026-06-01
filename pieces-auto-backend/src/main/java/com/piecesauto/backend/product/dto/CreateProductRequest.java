package com.piecesauto.backend.product.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateProductRequest {

    @NotBlank(message = "Le nom du produit est obligatoire")
    @Size(min = 2, max = 150, message = "Le nom doit contenir entre 2 et 150 caractères")
    private String name;

    @Size(max = 2000, message = "La description ne doit pas dépasser 2000 caractères")
    private String description;

    @NotNull(message = "Le prix normal est obligatoire")
    @Positive(message = "Le prix normal doit être positif")
    private BigDecimal normalPrice;

    @Positive(message = "Le prix groupé doit être positif")
    private BigDecimal groupPrice;

    @NotNull(message = "Le stock est obligatoire")
    @PositiveOrZero(message = "Le stock ne peut pas être négatif")
    private Integer stock;

    private String imageUrl;

    @NotBlank(message = "La référence est obligatoire")
    @Size(min = 2, max = 100, message = "La référence doit contenir entre 2 et 100 caractères")
    private String reference;

    @NotBlank(message = "La marque du produit est obligatoire")
    private String brandName;

    @Size(max = 1000, message = "Les tags de recherche image ne doivent pas dépasser 1000 caractères")
private String imageSearchTags;
}