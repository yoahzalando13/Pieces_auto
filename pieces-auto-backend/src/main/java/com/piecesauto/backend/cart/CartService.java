package com.piecesauto.backend.cart;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;

import com.piecesauto.backend.product.Product;
import com.piecesauto.backend.product.ProductRepository;
import com.piecesauto.backend.user.User;
import com.piecesauto.backend.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public Cart getOrCreateCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart cart = Cart.builder()
                            .user(user)
                            .build();

                    return cartRepository.save(cart);
                });
    }

    public Cart addProductToCart(Long userId, Long productId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new RuntimeException("La quantité doit être supérieure à 0");
        }

        Cart cart = getOrCreateCart(userId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produit introuvable"));

        if (!product.isActive()) {
            throw new RuntimeException("Ce produit n'est pas actif");
        }

        if (product.getStock() == null || product.getStock() < quantity) {
            throw new RuntimeException("Stock insuffisant");
        }

        CartItem cartItem = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), productId)
                .orElse(null);

        if (cartItem != null) {
            int newQuantity = cartItem.getQuantity() + quantity;

            if (product.getStock() < newQuantity) {
                throw new RuntimeException("Stock insuffisant pour cette quantité");
            }

            cartItem.setQuantity(newQuantity);
            cartItem.setUnitPrice(product.getNormalPrice());
            cartItem.calculateTotal();

            cartItemRepository.save(cartItem);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .unitPrice(product.getNormalPrice())
                    .build();

            newItem.calculateTotal();
            cart.getItems().add(newItem);
        }

        return cartRepository.save(cart);
    }

    public Cart updateItemQuantity(Long userId, Long productId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new RuntimeException("La quantité doit être supérieure à 0");
        }

        Cart cart = getOrCreateCart(userId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produit introuvable"));

        if (product.getStock() == null || product.getStock() < quantity) {
            throw new RuntimeException("Stock insuffisant");
        }

        CartItem item = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Produit introuvable dans le panier"));

        item.setQuantity(quantity);
        item.setUnitPrice(product.getNormalPrice());
        item.calculateTotal();

        cartItemRepository.save(item);

        return cartRepository.findById(cart.getId())
                .orElseThrow(() -> new RuntimeException("Panier introuvable"));
    }

    public Cart removeProductFromCart(Long userId, Long productId) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Produit introuvable dans le panier"));

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        return cartRepository.save(cart);
    }

    public Cart clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);

        cart.getItems().clear();

        return cartRepository.save(cart);
    }

    public BigDecimal calculateCartTotal(Long userId) {
        Cart cart = getOrCreateCart(userId);

        return cart.getItems()
                .stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}