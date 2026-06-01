package com.piecesauto.backend.groupbuy;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.piecesauto.backend.notification.NotificationService;
import com.piecesauto.backend.notification.NotificationType;
import com.piecesauto.backend.order.Order;
import com.piecesauto.backend.order.OrderItem;
import com.piecesauto.backend.order.OrderRepository;
import com.piecesauto.backend.order.OrderStatus;
import com.piecesauto.backend.product.Product;
import com.piecesauto.backend.product.ProductRepository;
import com.piecesauto.backend.user.User;
import com.piecesauto.backend.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GroupBuyService {

    private final GroupBuyRepository groupBuyRepository;
    private final GroupBuyParticipantRepository participantRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;

    @Transactional
    public GroupBuy createGroupBuy(
            Long userId,
            Long productId,
            Integer requiredParticipants,
            Integer quantityPerParticipant,
            Integer durationHours
    ) {
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produit introuvable"));

        if (!product.isActive()) {
            throw new RuntimeException("Ce produit n'est pas actif");
        }

        if (product.getGroupPrice() == null) {
            throw new RuntimeException("Ce produit n'a pas de prix groupé");
        }

        if (requiredParticipants == null || requiredParticipants < 2) {
            throw new RuntimeException("Un achat groupé doit avoir au moins 2 participants");
        }

        if (quantityPerParticipant == null || quantityPerParticipant <= 0) {
            throw new RuntimeException("La quantité doit être supérieure à 0");
        }

        if (durationHours == null || durationHours <= 0) {
            durationHours = 24;
        }

        int totalRequiredStock = requiredParticipants * quantityPerParticipant;

        if (product.getStock() == null || product.getStock() < totalRequiredStock) {
            throw new RuntimeException("Stock insuffisant pour créer cet achat groupé");
        }

        GroupBuy groupBuy = GroupBuy.builder()
                .groupCode(generateGroupCode())
                .product(product)
                .creator(creator)
                .groupPrice(product.getGroupPrice())
                .requiredParticipants(requiredParticipants)
                .currentParticipants(0)
                .quantityPerParticipant(quantityPerParticipant)
                .status(GroupBuyStatus.OPEN)
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusHours(durationHours))
                .participants(new ArrayList<>())
                .build();

        GroupBuy savedGroupBuy = groupBuyRepository.save(groupBuy);

        notificationService.createNotification(
                creator,
                "Achat groupé créé",
                "Votre achat groupé pour le produit " + product.getName() + " a été créé.",
                NotificationType.SYSTEM
        );

        joinGroupBuy(userId, savedGroupBuy.getId());

        return groupBuyRepository.findById(savedGroupBuy.getId())
                .orElseThrow(() -> new RuntimeException("Achat groupé introuvable"));
    }

    @Transactional
    public GroupBuy joinGroupBuy(Long userId, Long groupBuyId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        GroupBuy groupBuy = groupBuyRepository.findById(groupBuyId)
                .orElseThrow(() -> new RuntimeException("Achat groupé introuvable"));

        if (groupBuy.getStatus() != GroupBuyStatus.OPEN) {
            throw new RuntimeException("Cet achat groupé n'est plus ouvert");
        }

        if (groupBuy.getEndDate().isBefore(LocalDateTime.now())) {
            groupBuy.setStatus(GroupBuyStatus.EXPIRED);
            groupBuyRepository.save(groupBuy);
            throw new RuntimeException("Cet achat groupé a expiré");
        }

        if (participantRepository.existsByGroupBuyIdAndUserId(groupBuyId, userId)) {
            throw new RuntimeException("Vous participez déjà à cet achat groupé");
        }

        Product product = groupBuy.getProduct();

        int reservedQuantity = groupBuy.getCurrentParticipants() * groupBuy.getQuantityPerParticipant();
        int newRequiredQuantity = reservedQuantity + groupBuy.getQuantityPerParticipant();

        if (product.getStock() == null || product.getStock() < newRequiredQuantity) {
            throw new RuntimeException("Stock insuffisant pour rejoindre cet achat groupé");
        }

        Order order = createPendingGroupOrder(user, groupBuy);

        GroupBuyParticipant participant = GroupBuyParticipant.builder()
                .groupBuy(groupBuy)
                .user(user)
                .quantity(groupBuy.getQuantityPerParticipant())
                .order(order)
                .build();

        participantRepository.save(participant);

        groupBuy.setCurrentParticipants(groupBuy.getCurrentParticipants() + 1);

        notificationService.createNotification(
                user,
                "Participation ajoutée",
                "Vous avez rejoint l'achat groupé pour le produit " + product.getName() + ".",
                NotificationType.SYSTEM
        );

        if (groupBuy.getCurrentParticipants() >= groupBuy.getRequiredParticipants()) {
            groupBuy.setStatus(GroupBuyStatus.COMPLETED);
            groupBuy.setCompletedAt(LocalDateTime.now());

            int quantityToRemove = groupBuy.getRequiredParticipants() * groupBuy.getQuantityPerParticipant();
            product.setStock(product.getStock() - quantityToRemove);
            productRepository.save(product);

            confirmParticipantOrders(groupBuy.getId());
            notifyGroupBuyCompleted(groupBuy.getId());
        }

        return groupBuyRepository.save(groupBuy);
    }

    private Order createPendingGroupOrder(User user, GroupBuy groupBuy) {
        Product product = groupBuy.getProduct();

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .user(user)
                .status(OrderStatus.PENDING)
                .deliveryAddress("Adresse à confirmer")
                .customerPhone(user.getTelephone())
                .totalAmount(BigDecimal.ZERO)
                .items(new ArrayList<>())
                .build();

        OrderItem orderItem = OrderItem.builder()
                .order(order)
                .product(product)
                .quantity(groupBuy.getQuantityPerParticipant())
                .unitPrice(groupBuy.getGroupPrice())
                .build();

        orderItem.calculateTotal();

        order.getItems().add(orderItem);
        order.setTotalAmount(orderItem.getTotalPrice());

        return orderRepository.save(order);
    }

    private void confirmParticipantOrders(Long groupBuyId) {
        List<GroupBuyParticipant> participants = participantRepository.findByGroupBuyId(groupBuyId);

        for (GroupBuyParticipant participant : participants) {
            Order order = participant.getOrder();

            if (order != null && order.getStatus() == OrderStatus.PENDING) {
                order.setStatus(OrderStatus.CONFIRMED);
                orderRepository.save(order);
            }
        }
    }

    private void notifyGroupBuyCompleted(Long groupBuyId) {
        List<GroupBuyParticipant> participants = participantRepository.findByGroupBuyId(groupBuyId);

        for (GroupBuyParticipant participant : participants) {
            notificationService.createNotification(
                    participant.getUser(),
                    "Achat groupé complet",
                    "Votre achat groupé pour le produit "
                            + participant.getGroupBuy().getProduct().getName()
                            + " est maintenant complet.",
                    NotificationType.GROUP_BUY_COMPLETED
            );
        }
    }

    public List<GroupBuy> getOpenGroupBuys() {
        expireOldGroupBuys();
        return groupBuyRepository.findByStatusOrderByStartDateDesc(GroupBuyStatus.OPEN);
    }

    public List<GroupBuy> getCompletedGroupBuys() {
        return groupBuyRepository.findByStatusOrderByStartDateDesc(GroupBuyStatus.COMPLETED);
    }

    public GroupBuy getGroupBuyDetails(Long groupBuyId) {
        return groupBuyRepository.findById(groupBuyId)
                .orElseThrow(() -> new RuntimeException("Achat groupé introuvable"));
    }

    public List<GroupBuy> getOpenGroupBuysByProduct(Long productId) {
        expireOldGroupBuys();
        return groupBuyRepository.findByProductIdAndStatus(productId, GroupBuyStatus.OPEN);
    }

    public List<GroupBuyParticipant> getMyGroupBuyParticipations(Long userId) {
        return participantRepository.findByUserIdOrderByJoinedAtDesc(userId);
    }

    @Transactional
    public GroupBuy cancelGroupBuy(Long userId, Long groupBuyId) {
        GroupBuy groupBuy = groupBuyRepository.findById(groupBuyId)
                .orElseThrow(() -> new RuntimeException("Achat groupé introuvable"));

        if (!groupBuy.getCreator().getId().equals(userId)) {
            throw new RuntimeException("Seul le créateur peut annuler cet achat groupé");
        }

        if (groupBuy.getStatus() != GroupBuyStatus.OPEN) {
            throw new RuntimeException("Seul un achat groupé ouvert peut être annulé");
        }

        groupBuy.setStatus(GroupBuyStatus.CANCELLED);

        List<GroupBuyParticipant> participants = participantRepository.findByGroupBuyId(groupBuyId);

        for (GroupBuyParticipant participant : participants) {
            Order order = participant.getOrder();

            if (order != null && order.getStatus() == OrderStatus.PENDING) {
                order.setStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
            }

            notificationService.createNotification(
                    participant.getUser(),
                    "Achat groupé annulé",
                    "L'achat groupé pour le produit "
                            + groupBuy.getProduct().getName()
                            + " a été annulé.",
                    NotificationType.SYSTEM
            );
        }

        return groupBuyRepository.save(groupBuy);
    }

    @Transactional
    public void expireOldGroupBuys() {
        List<GroupBuy> openGroups = groupBuyRepository.findByStatusOrderByStartDateDesc(GroupBuyStatus.OPEN);

        for (GroupBuy groupBuy : openGroups) {
            if (groupBuy.getEndDate().isBefore(LocalDateTime.now())) {
                groupBuy.setStatus(GroupBuyStatus.EXPIRED);

                List<GroupBuyParticipant> participants = participantRepository.findByGroupBuyId(groupBuy.getId());

                for (GroupBuyParticipant participant : participants) {
                    Order order = participant.getOrder();

                    if (order != null && order.getStatus() == OrderStatus.PENDING) {
                        order.setStatus(OrderStatus.CANCELLED);
                        orderRepository.save(order);
                    }

                    notificationService.createNotification(
                            participant.getUser(),
                            "Achat groupé expiré",
                            "Votre achat groupé pour le produit "
                                    + groupBuy.getProduct().getName()
                                    + " a expiré.",
                            NotificationType.GROUP_BUY_EXPIRED
                    );
                }

                groupBuyRepository.save(groupBuy);
            }
        }
    }

    private String generateGroupCode() {
        String groupCode;

        do {
            groupCode = "GRP-" + UUID.randomUUID()
                    .toString()
                    .substring(0, 8)
                    .toUpperCase();
        } while (groupBuyRepository.existsByGroupCode(groupCode));

        return groupCode;
    }

    private String generateOrderNumber() {
        String orderNumber;

        do {
            orderNumber = "CMD-GRP-" + UUID.randomUUID()
                    .toString()
                    .substring(0, 8)
                    .toUpperCase();
        } while (orderRepository.existsByOrderNumber(orderNumber));

        return orderNumber;
    }
}