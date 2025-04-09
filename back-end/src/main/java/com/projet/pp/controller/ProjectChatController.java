package com.projet.pp.controller;

import com.projet.pp.model.ProjectChatMessage;
import com.projet.pp.service.ProjectChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chats")
public class ProjectChatController {

    @Autowired
    private ProjectChatService chatService;

    // Récupérer les messages d'un projet
    @GetMapping("/{projectId}/chat")
    public ResponseEntity<List<ProjectChatMessage>> getChatMessages(@PathVariable Long projectId) {
        List<ProjectChatMessage> messages = chatService.getMessagesByProjectId(projectId);
        return ResponseEntity.ok(messages);
    }

    // Envoyer un message dans le chat d'un projet
    @PostMapping("/{projectId}/chat")
    public ResponseEntity<ProjectChatMessage> sendChatMessage(
            @PathVariable Long projectId,
            @RequestBody Map<String, String> body) {
        // On attend dans le body "senderId" et "message"
        Long senderId = Long.valueOf(body.get("senderId"));
        String message = body.get("message");
        ProjectChatMessage chatMessage = chatService.sendMessage(projectId, senderId, message);
        return ResponseEntity.ok(chatMessage);
    }
}
