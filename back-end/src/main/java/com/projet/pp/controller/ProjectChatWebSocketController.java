// src/main/java/com/projet/pp/controller/ProjectChatWebSocketController.java
package com.projet.pp.controller;

import com.projet.pp.dto.ChatMessageDTO;
import com.projet.pp.model.ProjectChatMessage;
import com.projet.pp.service.ProjectChatService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.format.DateTimeFormatter;
import java.util.Map;

@Controller
public class ProjectChatWebSocketController {

    private final ProjectChatService chatService;
    private final SimpMessagingTemplate template;
    private final DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public ProjectChatWebSocketController(ProjectChatService svc,
                                          SimpMessagingTemplate template) {
        this.chatService = svc;
        this.template    = template;
    }

    @MessageMapping("/pchats/{projectId}/public")
    public void onPublic(@DestinationVariable Long projectId,
                         @Payload Map<String,String> payload) {
        Long senderId = Long.valueOf(payload.get("senderId"));
        String text   = payload.get("message");

        ProjectChatMessage saved = chatService.sendPublicMessage(projectId, senderId, text);

        ChatMessageDTO dto = ChatMessageDTO.builder()
                .id(saved.getId())
                .message(saved.getMessage())
                .createdAt(saved.getCreatedAt())
                .sender(new ChatMessageDTO.SenderDTO(
                        saved.getSender().getId(),
                        saved.getSender().getPrenom(),
                        saved.getSender().getNom()
                ))
                .build();

        template.convertAndSend(
                "/topic/pchats/" + projectId + "/public",
                dto
        );
    }

    @MessageMapping("/pchats/{projectId}/private")
    public void onPrivate(@DestinationVariable Long projectId,
                          @Payload Map<String,String> payload) {
        Long senderId = Long.valueOf(payload.get("senderId"));
        String text   = payload.get("message");

        ProjectChatMessage saved = chatService.sendPrivateMessage(projectId, senderId, text);

        ChatMessageDTO dto = ChatMessageDTO.builder()
                .id(saved.getId())
                .message(saved.getMessage())
                .createdAt(saved.getCreatedAt())
                .sender(new ChatMessageDTO.SenderDTO(
                        saved.getSender().getId(),
                        saved.getSender().getPrenom(),
                        saved.getSender().getNom()
                ))
                .build();

        template.convertAndSend(
                "/topic/pchats/" + projectId + "/private",
                dto
        );
    }
}
