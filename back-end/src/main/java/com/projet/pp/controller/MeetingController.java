// src/main/java/com/projet/pp/controller/MeetingController.java
package com.projet.pp.controller;

import com.projet.pp.dto.MeetingRequest;
import com.projet.pp.model.Meeting;
import com.projet.pp.model.Tache;
import com.projet.pp.model.User;
import com.projet.pp.model.ProjectTesterAssignment;
import com.projet.pp.service.MeetingService;
import com.projet.pp.service.TesterAssignmentService;
import com.projet.pp.model.Notification;
import com.projet.pp.service.NotificationService;
import com.projet.pp.service.TacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/projects/{pid}/meetings")
public class MeetingController {

    @Autowired private MeetingService svc;
    @Autowired private NotificationService notificationService;
    @Autowired private TesterAssignmentService testerAssignementService;
    @Autowired private TacheService tacheService;

    /** Planifier une réunion avec pièces‑jointes */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Meeting> schedule(
            @PathVariable("pid") Long projectId,
            @RequestPart("data") MeetingRequest data,
            @RequestPart(name="attachments", required = false) MultipartFile[] files
    ) {
        try {
            Meeting saved = svc.schedule(projectId, data, files);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
            LocalDateTime date = saved.getDate();
            String strDate = date.format(formatter);

            Notification noti = new Notification(
                    null,
                    saved.getProject().getUser(),
                    "Une Nouvelle reunion " ,
                    "vous a envoyé une nouvelle reunion nommée" + saved.getSubject() +" en " +strDate,
                    false,
                    LocalDateTime.now(),
                    null,
                    null,
                    null,
                    saved
            );

            notificationService.createNoti(noti);
            List<ProjectTesterAssignment> assignments = testerAssignementService.getAssignmentsByProjectId(projectId);
            assignments.forEach(assignment -> {
                User tester = assignment.getTesteur();

                Notification noti1 = new Notification(
                        null,
                        tester,
                        "Une Nouvelle reunion ",
                        "vous a envoyé une nouvelle reunion nommée" + saved.getSubject() + " en " + strDate,
                        false,
                        LocalDateTime.now(),
                        null,
                        null,
                        null,
                        saved
                );
                notificationService.createNoti(noti1);

            });

            Tache tache = tacheService.getTacheByProjectId(projectId).orElse(null);

            if (tache != null) {
                Notification noti2 = new Notification(
                        null,
                        tache.getAssignedBy(),
                        "Une Nouvelle reunion ",
                        "vous a envoyé une nouvelle reunion nommée" + saved.getSubject() + " en " + strDate,
                        false,
                        LocalDateTime.now(),
                        null,
                        null,
                        null,
                        saved
                );

                notificationService.createNoti(noti2);
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        }catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);
        }
    }

    /** Lister toutes les réunions d’un projet */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Meeting>> list(@PathVariable("pid") Long projectId) {
        return ResponseEntity.ok(svc.findByProject(projectId));
    }

    /** Télécharger une pièce‑jointe */
    @GetMapping(path="/attachments/{filename}", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable String filename
    ) {
        Resource file = svc.loadAttachment(filename);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .body(file);
    }


    @PostMapping(path = "/api/meetings",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Meeting> scheduleWithoutProject(
            @RequestPart("data") MeetingRequest data,
            @RequestPart(name = "attachments", required = false) MultipartFile[] files
    ) {
        try {
            Meeting saved = svc.scheduleNoProject(data, files);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
