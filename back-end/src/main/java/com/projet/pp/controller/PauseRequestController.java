package com.projet.pp.controller;

import com.projet.pp.dto.PauseRequestDto;
import com.projet.pp.model.PauseRequest;
import com.projet.pp.model.PauseStatus;
import com.projet.pp.model.User;
import com.projet.pp.model.Project;
import com.projet.pp.model.Notification;

import com.projet.pp.service.*;

import org.hibernate.annotations.TimeZoneColumn;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects/{projectId}/pause-requests")
public class PauseRequestController {
    @Autowired private PauseRequestService pauseSvc;
    @Autowired private NotificationService notificationService;
    @Autowired private ProjectService projectservice;
    @Autowired private UserService userService;
    @Autowired private ProjectPauseService projectPauseService;
    @PostMapping
    public ResponseEntity<PauseRequestDto> requestPause(
            @PathVariable Long projectId,
            @RequestBody PauseRequestDto dto
    ) {
        if (dto.getRequesterId() == null) {
            return ResponseEntity.badRequest().build();
        }
        PauseRequest pr = pauseSvc.create(projectId, dto.getRequesterId(), dto.getReason());
        Project project = projectservice.getProjectById(projectId);
        List <User> supervisers=userService.getUsersByRoleId(3L);
        for (User superviseur : supervisers) {
            Notification noti = new Notification(
                    null,
                    superviseur, // assign supervisor as the receiver
                    "Demande de pause",
                    "Nouvelle demande de pause pour le projet " + project.getName(),
                    false,
                    LocalDateTime.now(),
                    project,
                    null,
                    null,
                    null
            );

            notificationService.createNoti(noti);
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(PauseRequestDto.fromEntity(pr));
    }
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>>getPauseRequestStats(@PathVariable Long projectId){
        Map<String, Object> pr = pauseSvc.getStats();
        return ResponseEntity.ok(pr);
    }
    @GetMapping
    public ResponseEntity<List<PauseRequestDto>> list(@PathVariable Long projectId) {
        List<PauseRequestDto> pr=  pauseSvc.findByProject(projectId)
                .stream()
                .map(PauseRequestDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(pr);

    }

    /** Traiter (approve/reject) une demande de pause */
    @PutMapping("/{requestId}")
    public ResponseEntity<PauseRequestDto> handleRequest(
            @PathVariable Long projectId,
            @PathVariable Long requestId,
            @RequestBody Map<String,String> body
    ) {
        // dto.status doit valoir "APPROVED" ou "REJECTED"
        // 1. Validate status
        String statusValue = body.get("status");
        if (statusValue == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing status field");
        }

        PauseStatus ps;
        try {
            ps = PauseStatus.valueOf(statusValue.toUpperCase()); // Force uppercase
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid status. Valid values: " + Arrays.toString(PauseStatus.values()));
        }

        // 2. Validate supervisorId
        String supervisorIdStr = body.get("supervisorId");
        if (supervisorIdStr == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing supervisorId");
        }

        Long supervisorId;
        try {
            supervisorId = Long.parseLong(supervisorIdStr);
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid supervisorId format");
        }
        User superviser = userService.getUserById(supervisorId);
        PauseRequest pr = pauseSvc.updateStatus(projectId, requestId, ps, supervisorId);
        Long requesterId = pr.getRequesterId();
        User requester =userService.getUserById(requesterId);
        String action = ps == PauseStatus.APPROVED ? "approuvée" : "rejetée";
        Project project = projectservice.getProjectById(projectId);
        Notification noti = new Notification(
                null,
                requester,
                "Demande de pause traitée",
                "Votre demande pour le projet " + project.getName() + " a été " + action,
                false,
                LocalDateTime.now(),
                project,
                null,
                null,
                null
        );
        notificationService.createNoti(noti);
        if (ps == PauseStatus.APPROVED) {
            projectPauseService.createPauseByproject(project,superviser);
            Notification noti1 = new Notification(
                    null,
                    project.getUser(),
                    "Projet Suspendu",
                    "Votre  projet " + project.getName() + " a été " + "suspendu",
                    false,
                    LocalDateTime.now(),
                    project,
                    null,
                    null,
                    null
            );
            notificationService.createNoti(noti1);

        }
        return ResponseEntity.ok(PauseRequestDto.fromEntity(pr));
    }
}
