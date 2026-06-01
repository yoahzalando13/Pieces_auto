package com.piecesauto.backend.order;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.piecesauto.backend.order.dto.CreateOrderRequest;
import com.piecesauto.backend.order.dto.OrderResponse;
import com.piecesauto.backend.user.User;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

  @PostMapping("/checkout")
public OrderResponse createOrderFromCart(
        Authentication authentication,
        @Valid @RequestBody CreateOrderRequest request
) {
    User user = (User) authentication.getPrincipal();

    return OrderResponse.fromEntity(
            orderService.createOrderFromCart(
                    user.getId(),
                    request.getDeliveryAddress(),
                    request.getCustomerPhone()
            )
    );
}

    @GetMapping("/my")
public List<OrderResponse> getMyOrders(Authentication authentication) {
    User user = (User) authentication.getPrincipal();

    return orderService.getMyOrders(user.getId())
            .stream()
            .map(OrderResponse::fromEntity)
            .collect(Collectors.toList());
}

    @GetMapping("/my/{orderId}")
public OrderResponse getMyOrderDetails(
        Authentication authentication,
        @PathVariable Long orderId
) {
    User user = (User) authentication.getPrincipal();

    return OrderResponse.fromEntity(
            orderService.getMyOrderDetails(user.getId(), orderId)
    );
}

   @PutMapping("/my/{orderId}/cancel")
public OrderResponse cancelMyOrder(
        Authentication authentication,
        @PathVariable Long orderId
) {
    User user = (User) authentication.getPrincipal();

    return OrderResponse.fromEntity(
            orderService.cancelMyOrder(user.getId(), orderId)
    );
}

      @GetMapping("/admin")
public List<OrderResponse> getAllOrders() {
    return orderService.getAllOrders()
            .stream()
            .map(OrderResponse::fromEntity)
            .collect(Collectors.toList());
}

    @PutMapping("/admin/{orderId}/status")
public OrderResponse updateOrderStatus(
        @PathVariable Long orderId,
        @RequestParam OrderStatus status
) {
    return OrderResponse.fromEntity(
            orderService.updateOrderStatus(orderId, status)
    );
}

}