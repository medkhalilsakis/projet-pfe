package com.projet.pp.controller;

import com.projet.pp.model.ProjectChatMessage;
import com.projet.pp.service.ProjectChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pchats")
public class ProjectChatController {

    @Autowired
    private ProjectChatService chatService;

    // Récupérer les messages publics d'un projet
    @GetMapping("/{projectId}/public")
    public ResponseEntity<List<ProjectChatMessage>> getPublicMessages(@PathVariable Long projectId) {
        List<ProjectChatMessage> messages = chatService.getPublicMessages(projectId);
        return ResponseEntity.ok(messages);
    }

    // Récupérer les messages privés d'un projet
    // Le paramètre requesterId permet de vérifier que la demande provient de l'uploader
    @GetMapping("/{projectId}/private")
    public ResponseEntity<List<ProjectChatMessage>> getPrivateMessages(
            @PathVariable Long projectId,
            @RequestParam Long requesterId) {
        try {
            List<ProjectChatMessage> messages = chatService.getPrivateMessages(projectId, requesterId);
            return ResponseEntity.ok(messages);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(403).body(null);
        }
    }

    // Envoyer un message public
    @PostMapping("/{projectId}/public")
    public ResponseEntity<ProjectChatMessage> sendPublicMessage(
            @PathVariable Long projectId,
            @RequestBody Map<String, String> body) {
        String senderIdStr = body.get("senderId");
        if (senderIdStr == null || senderIdStr.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Long senderId = Long.valueOf(senderIdStr);
        String message = body.get("message");
        ProjectChatMessage chatMessage = chatService.sendPublicMessage(projectId, senderId, message);
        return ResponseEntity.ok(chatMessage);
    }

    // Envoyer un message privé
    @PostMapping("/{projectId}/private")
    public ResponseEntity<ProjectChatMessage> sendPrivateMessage(
            @PathVariable Long projectId,
            @RequestBody Map<String, String> body) {
        String senderIdStr = body.get("senderId");
        if (senderIdStr == null || senderIdStr.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Long senderId = Long.valueOf(senderIdStr);
        String message = body.get("message");
        ProjectChatMessage chatMessage = chatService.sendPrivateMessage(projectId, senderId, message);
        return ResponseEntity.ok(chatMessage);
    }
}
