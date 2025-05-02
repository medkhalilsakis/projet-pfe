package com.projet.pp.service;

import com.projet.pp.dto.NotificationDTO;
import com.projet.pp.model.Notification;
import com.projet.pp.model.User;
import com.projet.pp.repository.NotificationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    @Autowired
    NotificationRepository repo;
    @Autowired
    SimpMessagingTemplate ws;

    @Autowired private UserService userService;

    public NotificationDTO notifyUser(Long userId, String type, String payload) {

        User recipient = userService.getUserById(userId);

        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setType(type);
        n.setPayload(payload);
        repo.save(n);

        // 3) Construire le DTO et diffuser
        NotificationDTO dto = NotificationDTO.fromEntity(n);
        ws.convertAndSend("/topic/notifications/" + userId, dto);
        return dto;
    }

    public List<NotificationDTO> listFor(Long userId) {
        return repo.findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream().map(NotificationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Notification n = repo.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("Notification non trouvée"));
        n.setRead(true);
        repo.save(n);
        // (optionnel) renvoyer un event WebSocket pour mise à jour live
    }
}
