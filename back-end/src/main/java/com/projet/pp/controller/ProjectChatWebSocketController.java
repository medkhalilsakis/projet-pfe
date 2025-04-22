package com.projet.pp.controller;

import com.projet.pp.model.ProjectChatMessage;
import com.projet.pp.service.ProjectChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class ProjectChatWebSocketController {

    private final ProjectChatService chatService;
    private final SimpMessagingTemplate template;

    @Autowired
    public ProjectChatWebSocketController(
            ProjectChatService chatService,
            SimpMessagingTemplate template
    ) {
        this.chatService = chatService;
        this.template    = template;
    }

    @MessageMapping("/pchats/{projectId}/public")
    public void onPublic(
            @DestinationVariable Long projectId,
            @Payload Map<String,String> payload
    ) {
        Long senderId = Long.valueOf(payload.get("senderId"));
        String text   = payload.get("message");

        ProjectChatMessage saved = chatService.sendPublicMessage(projectId, senderId, text);

        template.convertAndSend(
                "/topic/pchats/" + projectId + "/public",
                saved
        );
    }

    @MessageMapping("/pchats/{projectId}/private")
    public void onPrivate(
            @DestinationVariable Long projectId,
            @Payload Map<String,String> payload
    ) {
        Long senderId = Long.valueOf(payload.get("senderId"));
        String text   = payload.get("message");

        ProjectChatMessage saved = chatService.sendPrivateMessage(projectId, senderId, text);

        template.convertAndSend(
                "/topic/pchats/" + projectId + "/private",
                saved
        );
    }
}
