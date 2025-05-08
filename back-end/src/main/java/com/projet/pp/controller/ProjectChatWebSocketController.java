package com.projet.pp.controller;

import com.projet.pp.dto.ProjectChatMessageDTO;
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

    public ProjectChatWebSocketController(ProjectChatService chatService,
                                          SimpMessagingTemplate template) {
        this.chatService = chatService;
        this.template = template;
    }

    @MessageMapping("/pchats/{projectId}")
    public void onMessage(
            @DestinationVariable Long projectId,
            @Payload Map<String, String> payload
    ) {
        Long senderId = Long.valueOf(payload.get("senderId"));
        String text = payload.get("message");

        // Enregistrer en base
        ProjectChatMessage saved = chatService.sendMessage(projectId, senderId, text);

        // Préparer le DTO à renvoyer
        ProjectChatMessageDTO dto = ProjectChatMessageDTO.builder()
                .id(saved.getId())
                .message(saved.getMessage())
                .createdAt(saved.getCreatedAt().format(fmt))  // Formatage de la date
                .sender(new ProjectChatMessageDTO.SenderDTO(
                        saved.getSender().getId(),
                        saved.getSender().getPrenom(),
                        saved.getSender().getNom()
                ))
                .attachments(chatService.getAttachments(saved.getId()).stream()
                        .map(att -> new ProjectChatMessageDTO.AttachmentDTO(
                                att.getId(),
                                att.getFileName(),
                                att.getMimeType()
                        ))
                        .toList())
                .build();

        // Diffuser à tous les abonnés du topic
        template.convertAndSend(
                "/topic/pchats/" + projectId,
                dto
        );
    }
}
