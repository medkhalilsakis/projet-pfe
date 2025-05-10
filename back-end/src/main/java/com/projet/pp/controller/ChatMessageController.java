// src/main/java/com/projet/pp/controller/ChatMessageController.java
package com.projet.pp.controller;

import com.projet.pp.dto.ChatMessageDTO;
import com.projet.pp.model.ChatMessage;
import com.projet.pp.model.Notification;
import com.projet.pp.service.ChatMessageService;
import com.projet.pp.service.NotificationService;
import com.projet.pp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatMessageController {

    @Autowired
    private ChatMessageService chatMessageService;

    @Autowired
    private UserService userService;
    @Autowired
    private NotificationService notificationService;

    /**
     * Envoi d'un message (avec pièces jointes éventuelles).
     */
    @PostMapping(
            path = "/send",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ChatMessageDTO> sendMessage(
            @RequestPart("data") ChatMessageDTO data,
            @RequestPart(name = "attachments", required = false) MultipartFile[] files
    ) {
        try {
            var sender   = userService.getUserById(data.getSender().getId());
            var receiver = userService.getUserById(data.getReceiver().getId());
            String roleLibelle = receiver.getRole().getLibelle().toLowerCase().trim();
            Notification.RoleType recipientRole;

            if (roleLibelle.equals("developpeur")) {
                recipientRole = Notification.RoleType.dev;
            } else if (roleLibelle.equals("testeur")) {
                recipientRole = Notification.RoleType.tester;
            } else if (roleLibelle.equals("superviseur")) {
                recipientRole = Notification.RoleType.admin;
            } else {
                recipientRole = Notification.RoleType.admin; // Default fallback
            }
            ChatMessage saved = chatMessageService.sendMessage(
                    sender,
                    receiver,
                    data.getMessage(),
                    data.getCreatedAt(),
                    files
            );
            Notification noti = new Notification(
                    null,
                    receiver,
                    recipientRole,
                    "Nouveau message ",
                    sender.getNom() + " vous a envooyé un nouveau message : " +saved.getMessage(),
                    false,
                    LocalDateTime.now(),
                    null,
                    null,
                    saved
                    ,null
            );

            notificationService.createNoti(noti);
            return ResponseEntity.ok(ChatMessageDTO.fromEntity(saved));

        } catch (IOException e) {
            // Log si nécessaire : logger.error("Erreur upload pièces jointes", e);
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(null);
        }
    }

    /**
     * Récupère l'historique complet entre deux utilisateurs.
     */
    @GetMapping(path = "/history/{senderId}/{receiverId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<ChatMessageDTO>> getChatHistory(
            @PathVariable Long senderId,
            @PathVariable Long receiverId
    ) {
        List<ChatMessage> msgs = chatMessageService.getChatHistory(senderId, receiverId);
        List<ChatMessageDTO> dtos = msgs.stream()
                .map(ChatMessageDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
