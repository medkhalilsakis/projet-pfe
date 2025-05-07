package com.projet.pp.controller;

import com.projet.pp.model.Notification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class NotificationWebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/notifications.send")
    public void sendNotification(@Payload Notification notification) {
        messagingTemplate.convertAndSend("/topic/notifications/" + notification.getUser().getId(), notification);
    }
}
