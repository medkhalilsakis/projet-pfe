package com.projet.pp.controller;

import com.projet.pp.model.Notification;
import com.projet.pp.model.User;
import com.projet.pp.service.NotificationService;
import com.projet.pp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    @PostMapping("/create")
    public Notification createNotification(@RequestBody Notification notification) {
        return notificationService.createNoti(notification);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getNotificationsByUser(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
            }
        List<Notification> notifications = notificationService.getNotificationsByUser(user);
        return ResponseEntity.ok(notifications); // ✅ Status 200 in headers, body = array
    }


    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnreadByUser(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        List<Notification> unread = notificationService.getUnreadNotifications(user);
        System.out.println("Unread notifications: ");
        unread.forEach(n -> System.out.println("ID: " + n.getId() + ", isRead: " + n.getIsRead()));
        return ResponseEntity.ok( unread);
    }

    @PostMapping("/user/{userId}/mark-read")
    public void markAsRead(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        notificationService.markAllAsRead(user);
    }

    @PostMapping("/user/{userId}/{notificationId}/mark-read")
    public void markAsRead(@PathVariable Long userId, @PathVariable Long notificationId ) {
        Notification notification =notificationService.getNotificationsById(notificationId);
        User user = userService.getUserById(userId);
        notificationService.markNotificationAsRead(notification,user);
    }

    @DeleteMapping("/{id}")
    public void deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Notification>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getAll());
    }

    @GetMapping("{id}")
    public ResponseEntity<Notification> getNotificationId(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.getNotificationsById(id));
    }

}
