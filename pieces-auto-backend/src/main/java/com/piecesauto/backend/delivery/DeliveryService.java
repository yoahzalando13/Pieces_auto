package com.piecesauto.backend.delivery;

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
import com.piecesauto.backend.payment.PaymentRepository;
import com.piecesauto.backend.payment.PaymentStatus;
import com.piecesauto.backend.user.User;
import com.piecesauto.backend.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;

    @Transactional
    public Delivery createDelivery(Long userId, Long orderId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Commande introuvable"));

        if (order.getStatus() != OrderStatus.PAID) {
            throw new RuntimeException("La commande doit être payée avant la livraison");
        }

        paymentRepository.findByOrderId(orderId)
                .filter(payment -> payment.getStatus() == PaymentStatus.SUCCESS)
                .orElseThrow(() -> new RuntimeException("Paiement validé introuvable pour cette commande"));

        if (deliveryRepository.existsByOrderId(orderId)) {
            return deliveryRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Livraison introuvable"));
        }

        Delivery delivery = Delivery.builder()
                .deliveryNumber(generateDeliveryNumber())
                .deliveryAddress(order.getDeliveryAddress())
                .customerPhone(order.getCustomerPhone())
                .transporterName("Transport local")
                .trackingNumber(generateTrackingNumber())
                .status(DeliveryStatus.PENDING)
                .note("Livraison créée après paiement")
                .order(order)
                .user(user)
                .build();

        Delivery savedDelivery = deliveryRepository.save(delivery);

        notificationService.createNotification(
                user,
                "Livraison créée",
                "La livraison de votre commande " + order.getOrderNumber() + " a été créée.",
                NotificationType.SYSTEM
        );

        return savedDelivery;
    }

    public List<Delivery> getMyDeliveries(Long userId) {
        return deliveryRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Delivery getMyDeliveryDetails(Long userId, Long deliveryId) {
        return deliveryRepository.findByIdAndUserId(deliveryId, userId)
                .orElseThrow(() -> new RuntimeException("Livraison introuvable"));
    }

    public Delivery getDeliveryByOrder(Long userId, Long orderId) {
        orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Commande introuvable"));

        return deliveryRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Livraison introuvable"));
    }

    public List<Delivery> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

    @Transactional
    public Delivery updateDeliveryStatus(Long deliveryId, DeliveryStatus status) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Livraison introuvable"));

        delivery.setStatus(status);

        if (status == DeliveryStatus.SHIPPED) {
            delivery.setShippedAt(LocalDateTime.now());
            delivery.getOrder().setStatus(OrderStatus.SHIPPED);

            notificationService.createNotification(
                    delivery.getUser(),
                    "Livraison expédiée",
                    "Votre commande " + delivery.getOrder().getOrderNumber() + " est en cours de livraison.",
                    NotificationType.DELIVERY_SHIPPED
            );
        }

        if (status == DeliveryStatus.DELIVERED) {
            delivery.setDeliveredAt(LocalDateTime.now());
            delivery.getOrder().setStatus(OrderStatus.DELIVERED);

            notificationService.createNotification(
                    delivery.getUser(),
                    "Livraison livrée",
                    "Votre commande " + delivery.getOrder().getOrderNumber() + " a été livrée avec succès.",
                    NotificationType.DELIVERY_DELIVERED
            );
        }

        if (status == DeliveryStatus.CANCELLED) {
            delivery.getOrder().setStatus(OrderStatus.CANCELLED);

            notificationService.createNotification(
                    delivery.getUser(),
                    "Livraison annulée",
                    "La livraison de votre commande " + delivery.getOrder().getOrderNumber() + " a été annulée.",
                    NotificationType.SYSTEM
            );
        }

        orderRepository.save(delivery.getOrder());

        return deliveryRepository.save(delivery);
    }

    private String generateDeliveryNumber() {
        String deliveryNumber;

        do {
            deliveryNumber = "DEL-" + UUID.randomUUID()
                    .toString()
                    .substring(0, 8)
                    .toUpperCase();
        } while (deliveryRepository.existsByDeliveryNumber(deliveryNumber));

        return deliveryNumber;
    }

    private String generateTrackingNumber() {
        return "TRK-" + UUID.randomUUID()
                .toString()
                .substring(0, 10)
                .toUpperCase();
    }
}