package com.piecesauto.backend.delivery;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.piecesauto.backend.delivery.dto.DeliveryResponse;
import com.piecesauto.backend.user.User;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DeliveryController {

    private final DeliveryService deliveryService;

    @PostMapping("/create/order/{orderId}")
public DeliveryResponse createDelivery(
        Authentication authentication,
        @PathVariable Long orderId
) {
    User user = (User) authentication.getPrincipal();

    return DeliveryResponse.fromEntity(
            deliveryService.createDelivery(user.getId(), orderId)
    );
}

@GetMapping("/my")
public List<DeliveryResponse> getMyDeliveries(Authentication authentication) {
    User user = (User) authentication.getPrincipal();

    return deliveryService.getMyDeliveries(user.getId())
            .stream()
            .map(DeliveryResponse::fromEntity)
            .collect(Collectors.toList());
}

@GetMapping("/my/{deliveryId}")
public DeliveryResponse getMyDeliveryDetails(
        Authentication authentication,
        @PathVariable Long deliveryId
) {
    User user = (User) authentication.getPrincipal();

    return DeliveryResponse.fromEntity(
            deliveryService.getMyDeliveryDetails(user.getId(), deliveryId)
    );
}

@GetMapping("/order/{orderId}")
public DeliveryResponse getDeliveryByOrder(
        Authentication authentication,
        @PathVariable Long orderId
) {
    User user = (User) authentication.getPrincipal();

    return DeliveryResponse.fromEntity(
            deliveryService.getDeliveryByOrder(user.getId(), orderId)
    );
}

@GetMapping("/admin")
public List<DeliveryResponse> getAllDeliveries() {
    return deliveryService.getAllDeliveries()
            .stream()
            .map(DeliveryResponse::fromEntity)
            .collect(Collectors.toList());
}

@PutMapping("/admin/{deliveryId}/status")
public DeliveryResponse updateDeliveryStatus(
        @PathVariable Long deliveryId,
        @RequestParam DeliveryStatus status
) {
    return DeliveryResponse.fromEntity(
            deliveryService.updateDeliveryStatus(deliveryId, status)
    );
}
}