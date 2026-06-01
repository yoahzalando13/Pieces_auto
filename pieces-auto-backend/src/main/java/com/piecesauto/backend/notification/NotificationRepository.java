package com.piecesauto.backend.notification;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByUserIdAndReadStatusFalseOrderByCreatedAtDesc(Long userId);

    Optional<Notification> findByIdAndUserId(Long notificationId, Long userId);

    long countByUserIdAndReadStatusFalse(Long userId);
}