package com.piecesauto.backend.notification;

import java.util.List;

import org.springframework.stereotype.Service;

import com.piecesauto.backend.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification createNotification(
            User user,
            String title,
            String message,
            NotificationType type
    ) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .readStatus(false)
                .build();

        return notificationRepository.save(notification);
    }

    public List<Notification> getMyNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getMyUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndReadStatusFalseOrderByCreatedAtDesc(userId);
    }

    public long countUnreadNotifications(Long userId) {
        return notificationRepository.countByUserIdAndReadStatusFalse(userId);
    }

    public Notification markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository
                .findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new RuntimeException("Notification introuvable"));

        notification.setReadStatus(true);

        return notificationRepository.save(notification);
    }

    public void markAllAsRead(Long userId) {
        List<Notification> notifications =
                notificationRepository.findByUserIdAndReadStatusFalseOrderByCreatedAtDesc(userId);

        for (Notification notification : notifications) {
            notification.setReadStatus(true);
        }

        notificationRepository.saveAll(notifications);
    }

    public void deleteNotification(Long userId, Long notificationId) {
        Notification notification = notificationRepository
                .findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new RuntimeException("Notification introuvable"));

        notificationRepository.delete(notification);
    }
}