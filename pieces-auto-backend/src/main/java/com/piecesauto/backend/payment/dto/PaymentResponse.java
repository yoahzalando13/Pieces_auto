package com.piecesauto.backend.payment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.piecesauto.backend.order.OrderStatus;
import com.piecesauto.backend.payment.Payment;
import com.piecesauto.backend.payment.PaymentMethod;
import com.piecesauto.backend.payment.PaymentStatus;

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
public class PaymentResponse {

    private Long id;
    private String paymentNumber;
    private BigDecimal amount;
    private PaymentMethod method;
    private PaymentStatus status;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
    private String note;

    private Long orderId;
    private String orderNumber;
    private OrderStatus orderStatus;

    private Long userId;

    public static PaymentResponse fromEntity(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .paymentNumber(payment.getPaymentNumber())
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .note(payment.getNote())
                .orderId(payment.getOrder().getId())
                .orderNumber(payment.getOrder().getOrderNumber())
                .orderStatus(payment.getOrder().getStatus())
                .userId(payment.getUser().getId())
                .build();
    }
}