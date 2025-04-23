// ProjectChatWebSocketController.java
package com.projet.pp.controller;

import com.projet.pp.dto.ChatMessageDto;
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
        this.template     = template;
    }

    @MessageMapping("/pchats/{projectId}/public")
    public void onPublic(@DestinationVariable Long projectId,
                         @Payload Map<String,String> payload) {
        Long senderId = Long.valueOf(payload.get("senderId"));
        String text   = payload.get("message");

        // 1) Sauvegarde en base
        ProjectChatMessage saved = chatService.sendPublicMessage(projectId, senderId, text);

        // 2) Projection dans un DTO plat
        ChatMessageDto dto = new ChatMessageDto(
                saved.getId(),
                saved.getMessage(),
                saved.getCreatedAt().format(fmt),
                new ChatMessageDto.SenderDto(
                        saved.getSender().getId(),
                        saved.getSender().getPrenom(),
                        saved.getSender().getNom()
                )
        );

        // 3) Diffuse uniquement le DTO
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

        ChatMessageDto dto = new ChatMessageDto(
                saved.getId(),
                saved.getMessage(),
                saved.getCreatedAt().format(fmt),
                new ChatMessageDto.SenderDto(
                        saved.getSender().getId(),
                        saved.getSender().getPrenom(),
                        saved.getSender().getNom()
                )
        );

        template.convertAndSend(
                "/topic/pchats/" + projectId + "/private",
                dto
        );
    }
}
