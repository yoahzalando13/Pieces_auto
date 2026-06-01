package com.piecesauto.backend.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByTelephone(String telephone);

    Optional<User> findByEmail(String email);

    boolean existsByTelephone(String telephone);

    boolean existsByEmail(String email);
}