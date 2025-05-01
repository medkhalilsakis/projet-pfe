package com.projet.pp.presence;

import com.projet.pp.model.User;
import com.projet.pp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Map;

@Component
public class PresenceListener {

    @Autowired private SimpMessagingTemplate messagingTemplate;
    @Autowired private UserRepository userRepository;

    @EventListener
    public void handleSessionConnect(SessionConnectEvent event) {
        Principal principal = event.getUser();
        if (principal == null) return;
        Long userId = Long.valueOf(principal.getName());
        userRepository.findById(userId).ifPresent(u -> {
            u.setOnline(true);
            userRepository.save(u);
            messagingTemplate.convertAndSend(
                    "/topic/presence",
                    Map.of("userId", userId, "online", true)
            );
        });
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        Principal principal = event.getUser();
        if (principal == null) return;
        Long userId = Long.valueOf(principal.getName());
        userRepository.findById(userId).ifPresent(u -> {
            u.setOnline(false);
            u.setLastSeen(LocalDateTime.now());
            userRepository.save(u);
            messagingTemplate.convertAndSend(
                    "/topic/presence",
                    Map.of("userId", userId, "online", false, "lastSeen", u.getLastSeen())
            );
        });
    }
}

