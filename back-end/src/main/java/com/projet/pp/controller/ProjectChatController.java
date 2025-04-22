package com.projet.pp.controller;

import com.projet.pp.model.ProjectChatMessage;
import com.projet.pp.service.ProjectChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pchats")
public class ProjectChatController {

    private final ProjectChatService chatService;

    @Autowired
    public ProjectChatController(ProjectChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/{projectId}/public")
    public List<ProjectChatMessage> getPublic(
            @PathVariable Long projectId
    ) {
        return chatService.getPublicMessages(projectId);
    }

    @GetMapping("/{projectId}/private")
    public ResponseEntity<List<ProjectChatMessage>> getPrivate(
            @PathVariable Long projectId,
            @RequestParam Long requesterId
    ) {
        try {
            return ResponseEntity.ok(chatService.getPrivateMessages(projectId, requesterId));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(403).build();
        }
    }
}
