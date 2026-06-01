package com.piecesauto.backend.delivery.dto;

import java.time.LocalDateTime;

import com.piecesauto.backend.delivery.Delivery;
import com.piecesauto.backend.delivery.DeliveryStatus;
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
public class DeliveryResponse {

    private Long id;
    private String deliveryNumber;
    private String deliveryAddress;
    private String customerPhone;
    private String transporterName;
    private String trackingNumber;
    private DeliveryStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private String note;

    private Long orderId;
    private String orderNumber;
    private OrderStatus orderStatus;

    private Long userId;

    public static DeliveryResponse fromEntity(Delivery delivery) {
        return DeliveryResponse.builder()
                .id(delivery.getId())
                .deliveryNumber(delivery.getDeliveryNumber())
                .deliveryAddress(delivery.getDeliveryAddress())
                .customerPhone(delivery.getCustomerPhone())
                .transporterName(delivery.getTransporterName())
                .trackingNumber(delivery.getTrackingNumber())
                .status(delivery.getStatus())
                .createdAt(delivery.getCreatedAt())
                .shippedAt(delivery.getShippedAt())
                .deliveredAt(delivery.getDeliveredAt())
                .note(delivery.getNote())
                .orderId(delivery.getOrder().getId())
                .orderNumber(delivery.getOrder().getOrderNumber())
                .orderStatus(delivery.getOrder().getStatus())
                .userId(delivery.getUser().getId())
                .build();
    }
}