package com.projet.pp.controller;

import com.projet.pp.dto.FinishedProjectDTO;
import com.projet.pp.model.Project;
import com.projet.pp.model.ProjectTesterAssignment;
import com.projet.pp.model.TestStatus;
import com.projet.pp.service.ProjectService;
import com.projet.pp.service.TesterAssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tester-assignments")
public class TesterAssignmentController {

    @Autowired
    private ProjectService Pservice;
    @Autowired
    private TesterAssignmentService service;

    /** Liste des projets en attente (status=1) */
    @GetMapping("/pending")
    public ResponseEntity<List<Project>> getPendingProjects() {
        List<Project> pendingProjects = service.findProjectsInPendingStateWithoutTesters();
        return ResponseEntity.ok(pendingProjects);
    }

    /** Liste des projets en cours de test (status=2) */
    @GetMapping("/in-test")
    public ResponseEntity<List<Project>> getInTestProjects() {
        return ResponseEntity.ok(service.findProjectsByStatus(2));
    }

    /** Liste des projets pausés ou clôturés (status=55 ou 99) ET ayant au moins un testeur assigné */
    @GetMapping("/finished")
    public ResponseEntity<List<Project>> getFinishedOrPaused() {
        // pour simplifier, on retourne tous ceux à 55 ou 99 ; côté front, on filtrera ceux sans assignations
        List<Project> list55 = service.findProjectsByStatus(55);
        List<Project> list99 = service.findProjectsByStatus(99);
        list55.addAll(list99);
        return ResponseEntity.ok(list55);
    }

    /** Désigner une nouvelle liste de testeurs et lancer la phase de test */
    @PostMapping("/{projectId}/assign")
    public ResponseEntity<Void> assignTesters(
            @PathVariable Long projectId,
            @RequestBody List<Long> testeurIds,
            @RequestParam Long superviseurId
    ) {
        service.assignTesters(projectId, testeurIds, superviseurId);
        return ResponseEntity.ok().build();
    }

    /** Mettre en pause ou clore la phase de test */
    @PostMapping("/{projectId}/phase")
    public ResponseEntity<Void> changePhase(
            @PathVariable Long projectId,
            @RequestParam("action") String action
    ) {
        TestStatus phase = switch (action) {
            case "pause"   -> TestStatus.en_pause;
            case "close"   -> TestStatus.cloture;
            default        -> throw new IllegalArgumentException("Action invalide");
        };
        service.changeProjectTestPhase(projectId, phase);
        return ResponseEntity.ok().build();
    }

    /** Relancer la phase de test */
    @PostMapping("/{projectId}/restart")
    public ResponseEntity<Void> restartPhase(@PathVariable Long projectId) {
        service.restartTestPhase(projectId);
        return ResponseEntity.ok().build();
    }

    /** Récupérer les testeurs assignés pour un projet */
    @GetMapping("/{projectId}/assignments")
    public ResponseEntity<List<ProjectTesterAssignment>> getAssignments(
            @PathVariable Long projectId
    ) {
        return ResponseEntity.ok(service.getAssignments(projectId));
    }


    @GetMapping("/finished-details")
    public ResponseEntity<List<FinishedProjectDTO>> getFinishedDetails() {
        List<FinishedProjectDTO> list = Pservice.getFinishedDetails();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/my/{testeurId}")
    public ResponseEntity<List<ProjectTesterAssignment>> getMyAssignments(
            @PathVariable Long testeurId) {
        List<ProjectTesterAssignment> assigns = service.getAssignmentsByTesteur(testeurId);
        return ResponseEntity.ok(assigns);
    }

}