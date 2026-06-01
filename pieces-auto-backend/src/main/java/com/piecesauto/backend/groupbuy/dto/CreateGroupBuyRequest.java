package com.piecesauto.backend.groupbuy.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateGroupBuyRequest {

    @NotNull(message = "Le nombre de participants est obligatoire")
    @Min(value = 2, message = "Un achat groupé doit avoir au moins 2 participants")
    @Max(value = 100, message = "Un achat groupé ne peut pas dépasser 100 participants")
    private Integer requiredParticipants;

    @NotNull(message = "La quantité par participant est obligatoire")
    @Min(value = 1, message = "La quantité doit être au moins 1")
    @Max(value = 50, message = "La quantité ne peut pas dépasser 50")
    private Integer quantityPerParticipant;

    @NotNull(message = "La durée est obligatoire")
    @Min(value = 1, message = "La durée minimale est 1 heure")
    @Max(value = 168, message = "La durée maximale est 168 heures")
    private Integer durationHours;
}