package com.piecesauto.backend.groupbuy.dto;

import java.time.LocalDateTime;

import com.piecesauto.backend.groupbuy.GroupBuyParticipant;
import com.piecesauto.backend.order.OrderStatus;

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
public class GroupBuyParticipantResponse {

    private Long id;
    private Integer quantity;
    private LocalDateTime joinedAt;

    private Long userId;
    private String userName;

    private Long orderId;
    private String orderNumber;
    private OrderStatus orderStatus;

    public static GroupBuyParticipantResponse fromEntity(GroupBuyParticipant participant) {
        return GroupBuyParticipantResponse.builder()
                .id(participant.getId())
                .quantity(participant.getQuantity())
                .joinedAt(participant.getJoinedAt())
                .userId(participant.getUser().getId())
                .userName(participant.getUser().getNom() + " " + participant.getUser().getPrenom())
                .orderId(participant.getOrder() != null ? participant.getOrder().getId() : null)
                .orderNumber(participant.getOrder() != null ? participant.getOrder().getOrderNumber() : null)
                .orderStatus(participant.getOrder() != null ? participant.getOrder().getStatus() : null)
                .build();
    }
}