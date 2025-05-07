package com.projet.pp.service;

import com.projet.pp.model.Notification;
import com.projet.pp.model.User;
import com.projet.pp.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.http.ResponseEntity; // For ResponseEntity
import org.springframework.messaging.simp.SimpMessagingTemplate; // For WebSocket messaging
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;


    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;
    // Create a new notification
    public Notification createNoti(Notification notification) {
        Notification saved = notificationRepository.save(notification);
        // Send via WebSocket
        simpMessagingTemplate.convertAndSend("/topic/notifications/" + saved.getUser().getId(), saved);
        return saved;
    }
    public Notification getNotificationsById(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + id));
    }


    // Get all notifications for a specific user
    public List<Notification> getNotificationsByUser(User user) {
        return notificationRepository.findByUser(user);
    }

    // Get unread notifications
    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository.findUnreadByUser(user);
    }

    // Mark all notifications as read
    public void markAllAsRead(User user) {
        List<Notification> notifications = getUnreadNotifications(user);
        for (Notification n : notifications) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(notifications);
    }

    // Delete notification by ID
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    // Get all notifications
    public List<Notification> getAll() {
        return notificationRepository.findAll();
    }
    public void markNotificationAsRead(Notification notification, User user) {
        // Ensure the notification belongs to the user (optional but safer)
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Notification does not belong to this user");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

}
