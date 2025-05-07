package com.projet.pp.controller;

import com.projet.pp.model.Notification;
import com.projet.pp.model.Project;

import com.projet.pp.model.ProjectChatMessage;
import com.projet.pp.model.User;
import com.projet.pp.service.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chats")
public class ProjectChatController {

    @Autowired
    private ProjectChatService chatService;
    @Autowired
    private ProjectService projectService;
    @Autowired
    private TesterAssignmentService testerAssignmentService;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private TacheService tacheService;

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
        Project p =projectService.getProjectById(projectId);
        ProjectChatMessage chatMessage = chatService.sendMessage(projectId, senderId, message);
        User sender = chatMessage.getSender();
        if (sender.getRole().getLibelle().equals("developpeur")){

            Notification noti1 = new Notification(
                    null,
                    testerAssignmentService.getTesterByProjectId(projectId),
                    Notification.RoleType.tester,
                    "Nouveau message du proejt ",
                    sender.getNom() + " a envooyé un nouveau message en " + p.getName() ,
                    false,
                    LocalDateTime.now(),
                    p,
                    null,null
            );
            notificationService.createNoti(noti1);

            Notification noti2 = new Notification(
                    null,
                    tacheService.getTacheByProjectId(projectId).get().getAssignedBy(),
                    Notification.RoleType.admin,
                    "Nouveau message du proejt ",
                    sender.getNom() + " a envooyé un nouveau message en " + p.getName() ,
                    false,
                    LocalDateTime.now(),
                    p,
                    null
                    ,null
            );
            notificationService.createNoti(noti2);

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
                    null

            );

            notificationService.createNoti(noti);


            Notification noti2 = new Notification(
                    null,
                    tacheService.getTacheByProjectId(projectId).get().getAssignedBy(),
                    Notification.RoleType.admin,
                    "Nouveau message du proejt ",
                    sender.getNom() + " a envooyé un nouveau message en " + p.getName(),
                    false,
                    LocalDateTime.now(),
                    p,
                    null,
                    null
            );
            notificationService.createNoti(noti2);
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
                        ,null
                );
                notificationService.createNoti(noti1);

                Notification noti2 = new Notification(
                        null,
                        testerAssignmentService.getTesterByProjectId(projectId),
                        Notification.RoleType.tester,
                        "Nouveau message du proejt ",
                        sender.getNom() + " a envooyé un nouveau message en " + p.getName() ,
                        false,
                        LocalDateTime.now(),
                        p,
                        null
                        ,null
                );
                notificationService.createNoti(noti2);

            }
        return ResponseEntity.ok(chatMessage);
    }
}
