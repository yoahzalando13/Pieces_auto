package com.piecesauto.backend.payment;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.piecesauto.backend.notification.NotificationService;
import com.piecesauto.backend.notification.NotificationType;
import com.piecesauto.backend.order.Order;
import com.piecesauto.backend.order.OrderRepository;
import com.piecesauto.backend.order.OrderStatus;
import com.piecesauto.backend.user.User;
import com.piecesauto.backend.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public Payment payOrder(Long userId, Long orderId, PaymentMethod method) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Commande introuvable"));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Impossible de payer une commande annulée");
        }

        if (order.getStatus() == OrderStatus.PAID) {
            throw new RuntimeException("Cette commande est déjà payée");
        }

        if (paymentRepository.existsByOrderId(orderId)) {
            Payment existingPayment = paymentRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Paiement introuvable"));

            if (existingPayment.getStatus() == PaymentStatus.SUCCESS) {
                throw new RuntimeException("Cette commande possède déjà un paiement validé");
            }

            existingPayment.setStatus(PaymentStatus.SUCCESS);
            existingPayment.setMethod(method);
            existingPayment.setPaidAt(LocalDateTime.now());
            existingPayment.setNote("Paiement simulé avec succès");

            order.setStatus(OrderStatus.PAID);
            orderRepository.save(order);

            Payment savedPayment = paymentRepository.save(existingPayment);

            notificationService.createNotification(
                    user,
                    "Paiement réussi",
                    "Votre commande " + order.getOrderNumber() + " a été payée avec succès.",
                    NotificationType.PAYMENT_SUCCESS
            );

            return savedPayment;
        }

        Payment payment = Payment.builder()
                .paymentNumber(generatePaymentNumber())
                .amount(order.getTotalAmount())
                .method(method)
                .status(PaymentStatus.SUCCESS)
                .paidAt(LocalDateTime.now())
                .note("Paiement simulé avec succès")
                .order(order)
                .user(user)
                .build();

        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);

        Payment savedPayment = paymentRepository.save(payment);

        notificationService.createNotification(
                user,
                "Paiement réussi",
                "Votre commande " + order.getOrderNumber() + " a été payée avec succès.",
                NotificationType.PAYMENT_SUCCESS
        );

        return savedPayment;
    }

    public Payment getPaymentByOrder(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Commande introuvable"));

        return paymentRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new RuntimeException("Paiement introuvable"));
    }

    public List<Payment> getMyPayments(Long userId) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment failPayment(Long userId, Long orderId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Commande introuvable"));

        Payment payment = Payment.builder()
                .paymentNumber(generatePaymentNumber())
                .amount(order.getTotalAmount())
                .method(PaymentMethod.SIMULATION)
                .status(PaymentStatus.FAILED)
                .note("Paiement simulé échoué")
                .order(order)
                .user(user)
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        notificationService.createNotification(
                user,
                "Paiement échoué",
                "Le paiement de votre commande " + order.getOrderNumber() + " a échoué.",
                NotificationType.PAYMENT_FAILED
        );

        return savedPayment;
    }

    private String generatePaymentNumber() {
        String paymentNumber;

        do {
            paymentNumber = "PAY-" + UUID.randomUUID()
                    .toString()
                    .substring(0, 8)
                    .toUpperCase();
        } while (paymentRepository.existsByPaymentNumber(paymentNumber));

        return paymentNumber;
    }
}