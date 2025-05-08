// src/main/java/com/projet/pp/ws/ProjectChatWebSocketController.java
package com.projet.pp.controller;

import com.projet.pp.dto.ProjectChatMessageDTO;
import com.projet.pp.service.ProjectChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@Controller
public class ProjectChatWebSocketController {
    @Autowired private ProjectChatService svc;
    @Autowired private SimpMessagingTemplate broker;

    /**
     * Reçoit les messages depuis le client STOMP (/app/chat.send)
     * et rebroadcast sur /topic/chat.{projectId}
     */
    @MessageMapping("/chat.send")
    public void receive(@Payload ChatPayload payload,
                        Principal principal /*le user authentifié*/) throws Exception {
        Long senderId = Long.valueOf(principal.getName());
        ProjectChatMessageDTO dto = svc.postMessage(
                payload.getProjectId(),
                senderId,
                payload.getMessage(),
                payload.getFiles()
        );
        broker.convertAndSend("/topic/chat." + payload.getProjectId(), dto);
    }

    /** Payload STOMP pour l’envoi d’un message */
    public static class ChatPayload {
        private Long projectId;
        private String message;
        private MultipartFile[] files; // ou List<String> base64 si vous encodez côté client

        public ChatPayload() {}
        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public MultipartFile[] getFiles() { return files; }
        public void setFiles(MultipartFile[] files) { this.files = files; }
    }

}
