// src/main/java/com/projet/pp/controller/ProjectChatController.java
package com.projet.pp.controller;

import com.projet.pp.model.*;
import com.projet.pp.dto.ProjectChatMessageDTO;
import com.projet.pp.service.ProjectChatService;
import com.projet.pp.service.NotificationService;
import com.projet.pp.service.ProjectService;
import com.projet.pp.service.TacheService;

import com.projet.pp.service.UserService;
import com.projet.pp.service.TesterAssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects/{projectId}/chat")
public class ProjectChatController {
    @Autowired private ProjectChatService svc;
    @Autowired private NotificationService notificationService;
    @Autowired private ProjectService projectService;
    @Autowired private UserService userService;
    @Autowired private TesterAssignmentService testerAssignmentService;
    @Autowired private TacheService tacheService;
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
            @RequestPart("message") String message,
            @RequestPart(name="files", required=false) MultipartFile[] files
    ) throws Exception {
        ProjectChatMessageDTO pcdto= svc.postMessage(projectId, senderId, message, files);
        Project p =projectService.getProjectById(projectId);
        User sender = userService.getUserById(senderId);
        if (sender.getRole().getLibelle().equals("developpeur")){

            Notification noti1 = new Notification(
                    null,
                    testerAssignmentService.getAssignmentByProjectId(projectId).getTesteur(),
                    Notification.RoleType.tester,
                    "Nouveau message du proejt ",
                    sender.getNom() + " a envooyé un nouveau message en " + p.getName() ,
                    false,
                    LocalDateTime.now(),
                    p,
                    null,
                    null,
                    null
            );
            notificationService.createNoti(noti1);
            Tache tache = tacheService.getTacheById(projectId).orElse(null);

            if (tache != null) {
                Notification noti2 = new Notification(
                        null,
                        tache.getAssignedBy(),
                        Notification.RoleType.admin,
                        "Nouveau message du proejt ",
                        sender.getNom() + " a envooyé un nouveau message en " + p.getName(),
                        false,
                        LocalDateTime.now(),
                        p,
                        null,
                        null,
                        null
                );
                notificationService.createNoti(noti2);
            }

        }
        if (sender.getRole().getLibelle().equals("testeur")) {

            Notification noti = new Notification(
                    null,
                    projectService.getProjectById(projectId).getUser(),
                    Notification.RoleType.dev,
                    "Nouveau message du proejt ",
                    sender.getNom() + " a envooyé un nouveau message en " + p.getName(),
                    false,
                    LocalDateTime.now(),
                    p,
                    null,
                    null,null

            );

            notificationService.createNoti(noti);


            Tache tache = tacheService.getTacheById(projectId).orElse(null);

            if (tache != null) {
                Notification noti2 = new Notification(
                        null,
                        tache.getAssignedBy(),
                        Notification.RoleType.admin,
                        "Nouveau message du proejt ",
                        sender.getNom() + " a envooyé un nouveau message en " + p.getName(),
                        false,
                        LocalDateTime.now(),
                        p,
                        null,
                        null,
                        null
                );
                notificationService.createNoti(noti2);
            }
        }
        if (sender.getRole().getLibelle().equals("superviseur")){

            Notification noti1 = new Notification(
                    null,
                    projectService.getProjectById(projectId).getUser(),
                    Notification.RoleType.dev,
                    "Nouveau message du proejt ",
                    sender.getNom() + " a envooyé un nouveau message en " + p.getName() ,
                    false,
                    LocalDateTime.now(),
                    p,
                    null
                    ,null,
                    null
            );
            notificationService.createNoti(noti1);

            Notification noti2 = new Notification(
                    null,
                    testerAssignmentService.getAssignmentByProjectId(projectId).getTesteur(),
                    Notification.RoleType.tester,
                    "Nouveau message du proejt ",
                    sender.getNom() + " a envooyé un nouveau message en " + p.getName() ,
                    false,
                    LocalDateTime.now(),
                    p,
                    null
                    ,null,null
            );
            notificationService.createNoti(noti2);

        }

        return pcdto;
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
