// src/main/java/com/projet/pp/controller/ProjectChatController.java
package com.projet.pp.controller;

import com.projet.pp.dto.ProjectChatMessageDTO;
import com.projet.pp.service.ProjectChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects/{projectId}/chat")
public class ProjectChatController {
    @Autowired private ProjectChatService svc;

    @Autowired private SimpMessagingTemplate broker;

    /** Historique */
    @GetMapping
    public List<ProjectChatMessageDTO> list(@PathVariable Long projectId) {
        return svc.listMessages(projectId);
    }

    /** Envoi d’un message + pièces jointes */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProjectChatMessageDTO send(
            @PathVariable Long projectId,
            @RequestParam Long senderId,
            @RequestParam String message,
            @RequestParam(name="files", required=false) MultipartFile[] files
    ) throws Exception {
        return svc.postMessage(projectId, senderId, message, files);
    }


    /** Télécharger une pièce jointe */
    @GetMapping("/attachments/{attId}")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long projectId,
                                                       @PathVariable Long attId) throws Exception {
        Resource res = svc.loadAttachment(attId);
        String ct = Files.probeContentType(Path.of(res.getURI()));
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(ct))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + res.getFilename() + "\"")
                .body(res);
    }

    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long projectId,
            @PathVariable Long messageId) {
        svc.deleteMessage(messageId);
        broker.convertAndSend("/topic/chat." + projectId + ".delete",
                Map.of("messageId", messageId));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable Long projectId,
            @PathVariable Long attachmentId) {
        svc.deleteAttachment(attachmentId);
        broker.convertAndSend("/topic/chat." + projectId + ".deleteAtt",
                Map.of("attachmentId", attachmentId));
        return ResponseEntity.noContent().build();
    }
}
