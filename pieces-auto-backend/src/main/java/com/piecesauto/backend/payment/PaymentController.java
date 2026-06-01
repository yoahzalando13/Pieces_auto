package com.piecesauto.backend.payment;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.piecesauto.backend.payment.dto.PaymentResponse;
import com.piecesauto.backend.user.User;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/pay/order/{orderId}")
public PaymentResponse payOrder(
        Authentication authentication,
        @PathVariable Long orderId,
        @RequestParam(defaultValue = "SIMULATION") PaymentMethod method
) {
    User user = (User) authentication.getPrincipal();

    return PaymentResponse.fromEntity(
            paymentService.payOrder(user.getId(), orderId, method)
    );
}

@PostMapping("/fail/order/{orderId}")
public PaymentResponse failPayment(
        Authentication authentication,
        @PathVariable Long orderId
) {
    User user = (User) authentication.getPrincipal();

    return PaymentResponse.fromEntity(
            paymentService.failPayment(user.getId(), orderId)
    );
}

@GetMapping("/my")
public List<PaymentResponse> getMyPayments(Authentication authentication) {
    User user = (User) authentication.getPrincipal();

    return paymentService.getMyPayments(user.getId())
            .stream()
            .map(PaymentResponse::fromEntity)
            .collect(Collectors.toList());
}

@GetMapping("/order/{orderId}")
public PaymentResponse getPaymentByOrder(
        Authentication authentication,
        @PathVariable Long orderId
) {
    User user = (User) authentication.getPrincipal();

    return PaymentResponse.fromEntity(
            paymentService.getPaymentByOrder(user.getId(), orderId)
    );
}

@GetMapping("/admin")
public List<PaymentResponse> getAllPayments() {
    return paymentService.getAllPayments()
            .stream()
            .map(PaymentResponse::fromEntity)
            .collect(Collectors.toList());
}
}