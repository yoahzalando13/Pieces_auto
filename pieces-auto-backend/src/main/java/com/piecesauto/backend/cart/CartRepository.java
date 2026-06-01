package com.piecesauto.backend.cart;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.piecesauto.backend.user.User;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUser(User user);

    Optional<Cart> findByUserId(Long userId);
}