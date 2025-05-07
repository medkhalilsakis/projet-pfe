package com.projet.pp.controller;

import com.projet.pp.model.Notification;
import com.projet.pp.model.User;
import com.projet.pp.service.NotificationService;
import com.projet.pp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
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
    public List<Notification> getNotificationsByUser(@PathVariable Long userId) {
        System.out.println("userId");
        User user = userService.getUserById(userId);
        System.out.println("fvjgbhbkhb");
        return notificationService.getNotificationsByUser(user);
    }

    @GetMapping("/user/{userId}/unread")
    public List<Notification> getUnreadByUser(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        List<Notification> unread = notificationService.getUnreadNotifications(user);
        System.out.println("Unread notifications: ");
        unread.forEach(n -> System.out.println("ID: " + n.getId() + ", isRead: " + n.getIsRead()));
        return unread;
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
    public List<Notification> getAllNotifications() {
        return notificationService.getAll();
    }
}
