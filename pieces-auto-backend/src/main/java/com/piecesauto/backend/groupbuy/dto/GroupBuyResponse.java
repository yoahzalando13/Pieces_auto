package com.piecesauto.backend.groupbuy.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.piecesauto.backend.groupbuy.GroupBuy;
import com.piecesauto.backend.groupbuy.GroupBuyStatus;

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
public class GroupBuyResponse {

    private Long id;
    private String groupCode;
    private BigDecimal groupPrice;
    private Integer requiredParticipants;
    private Integer currentParticipants;
    private Integer quantityPerParticipant;
    private GroupBuyStatus status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime completedAt;

    private Long productId;
    private String productName;
    private String productReference;
    private String productBrandName;
    private String productImageUrl;

    private Long creatorId;
    private String creatorName;

    private List<GroupBuyParticipantResponse> participants;

    public static GroupBuyResponse fromEntity(GroupBuy groupBuy) {
        return GroupBuyResponse.builder()
                .id(groupBuy.getId())
                .groupCode(groupBuy.getGroupCode())
                .groupPrice(groupBuy.getGroupPrice())
                .requiredParticipants(groupBuy.getRequiredParticipants())
                .currentParticipants(groupBuy.getCurrentParticipants())
                .quantityPerParticipant(groupBuy.getQuantityPerParticipant())
                .status(groupBuy.getStatus())
                .startDate(groupBuy.getStartDate())
                .endDate(groupBuy.getEndDate())
                .completedAt(groupBuy.getCompletedAt())

                .productId(groupBuy.getProduct().getId())
                .productName(groupBuy.getProduct().getName())
                .productReference(groupBuy.getProduct().getReference())
                .productBrandName(groupBuy.getProduct().getBrandName())
                .productImageUrl(groupBuy.getProduct().getImageUrl())

                .creatorId(groupBuy.getCreator().getId())
                .creatorName(groupBuy.getCreator().getNom() + " " + groupBuy.getCreator().getPrenom())

                .participants(
                        groupBuy.getParticipants() == null
                                ? List.of()
                                : groupBuy.getParticipants()
                                        .stream()
                                        .map(GroupBuyParticipantResponse::fromEntity)
                                        .collect(Collectors.toList())
                )
                .build();
    }
}