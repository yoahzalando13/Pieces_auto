package com.piecesauto.backend.cart;

import java.math.BigDecimal;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.piecesauto.backend.cart.dto.CartResponse;
import com.piecesauto.backend.user.User;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    @GetMapping
public CartResponse getMyCart(Authentication authentication) {
    User user = (User) authentication.getPrincipal();
    return CartResponse.fromEntity(cartService.getOrCreateCart(user.getId()));
}

@PostMapping("/add/{productId}")
public CartResponse addProductToCart(
        Authentication authentication,
        @PathVariable Long productId,
        @RequestParam Integer quantity
) {
    User user = (User) authentication.getPrincipal();

    return CartResponse.fromEntity(
            cartService.addProductToCart(user.getId(), productId, quantity)
    );
}

@PutMapping("/update/{productId}")
public CartResponse updateItemQuantity(
        Authentication authentication,
        @PathVariable Long productId,
        @RequestParam Integer quantity
) {
    User user = (User) authentication.getPrincipal();

    return CartResponse.fromEntity(
            cartService.updateItemQuantity(user.getId(), productId, quantity)
    );
}

@DeleteMapping("/remove/{productId}")
public CartResponse removeProductFromCart(
        Authentication authentication,
        @PathVariable Long productId
) {
    User user = (User) authentication.getPrincipal();

    return CartResponse.fromEntity(
            cartService.removeProductFromCart(user.getId(), productId)
    );
}

@DeleteMapping("/clear")
public CartResponse clearCart(Authentication authentication) {
    User user = (User) authentication.getPrincipal();

    return CartResponse.fromEntity(
            cartService.clearCart(user.getId())
    );
}

    @GetMapping("/total")
    public BigDecimal getCartTotal(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return cartService.calculateCartTotal(user.getId());
    }
}