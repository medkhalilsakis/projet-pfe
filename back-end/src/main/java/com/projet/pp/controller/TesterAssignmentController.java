package com.projet.pp.controller;

import com.projet.pp.dto.FinishedProjectDTO;
import com.projet.pp.model.*;
import com.projet.pp.service.ProjectService;
import com.projet.pp.service.TesterAssignmentService;
import com.projet.pp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

    @Autowired
    private UserService userService;

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
    @PutMapping("/{id}/syncStatus")
    public ResponseEntity<Void> syncStatus(@PathVariable Long id) {
        service.syncStatus(id);
        return ResponseEntity.ok().build();
    }
    /** Mettre en pause ou clore la phase de test */
    @PostMapping("/{projectId}/phase")
    public ResponseEntity<Void> changePhase(
            @PathVariable Long projectId,
            @RequestParam("action") String action
    ) {
        TestStatus phase;
        switch (action) {
            case "en_pause":
                phase = TestStatus.en_pause;
                break;
            case "cloture":
                phase = TestStatus.cloture;
                break;
            case "en_cours":
                phase = TestStatus.en_cours;
                break;
            case "termine":
                phase = TestStatus.termine;
                break;
            default:
                throw new IllegalArgumentException("Action invalide");
        }

        // Changer l'état du projet selon la phase
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
    @GetMapping("/my/{testeurId}/{status}")
    public ResponseEntity<List<ProjectTesterAssignment>> getMyAssignments(
            @PathVariable Long testeurId,
            @PathVariable String status
    ) {
        TestStatus ts=TestStatus.valueOf(status);
        List<ProjectTesterAssignment> assigns = service.getAssignmentsByTesteurAndStatus(testeurId,ts);
        return ResponseEntity.ok(assigns);
    }


    @PutMapping("/{assignmentId}/decision")
    public ResponseEntity<Void> updateTesterDecision(
            @PathVariable Long assignmentId,
            @RequestParam("decision") TestApproval decision,
            @RequestParam("rapportTestPath") String rapportTestPath) {

        service.updateTesterDecision(assignmentId, decision, rapportTestPath);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/approve-phase/{projectId}")
    public ResponseEntity<Void> approvePhase(@PathVariable Long projectId) {
        try {
            service.approvePhase(projectId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }



    @PostMapping("/{assignmentId}/upload-report")
    public ResponseEntity<String> uploadTestReport(
            @PathVariable Long assignmentId,
            @RequestParam("report") MultipartFile file) {

        // Appeler le service pour uploader le fichier et récupérer le chemin
        String filePath = service.uploadReport(assignmentId, file);

        // Retourner le chemin du fichier
        return ResponseEntity.ok(filePath);
    }


    @GetMapping("/{projectId}/testeurs")
    public ResponseEntity<List<User>> getTesteursExcept(
            @PathVariable Long projectId,
            @RequestParam(value = "excludeTesterId", required = false) Long excludeTesterId
    ) {
        // Appeler le service pour récupérer la liste des testeurs excluant celui spécifié
        List<User> testeurs = service.getTesteursExcept(projectId, excludeTesterId);
        return ResponseEntity.ok(testeurs);
    }

    @GetMapping("stats")
    public ResponseEntity<Map<String, Object>> stats() {
        Map<String, Object> testStats = service.getTestStats();
        System.out.println(testStats);

        return ResponseEntity.ok(testStats);
    }
    @GetMapping("stats/{id}")
    public ResponseEntity<Map<String, Object>> testerStats(@PathVariable Long id) {
        Map<String, Object> testStats = service.getTesterStats(id);
        System.out.println(testStats);

        return ResponseEntity.ok(testStats);
    }
    @GetMapping("/devstats")
    public ResponseEntity<?> getDevStats() {
        List<?> devstats= userService.getAllDeveloperStats();
        System.out.println(devstats);
        return ResponseEntity.ok(devstats);
    }
    @GetMapping("/devstats/{id}")
    public ResponseEntity<?> getDevStatsByID(@PathVariable Long id) {
        Map<String, Object> devstats= userService.getDeveloperStatsById(id);
        System.out.println(devstats);
        return ResponseEntity.ok(devstats);
    }@GetMapping("/devstats/test/{id}")
    public ResponseEntity<?> getDevTestingStatsByID(@PathVariable Long id) {
        Map<String, Object> devstats= userService.getDevTestingStatsByID(id);
        System.out.println(devstats);
        return ResponseEntity.ok(devstats);
    }
    @GetMapping("/testerstats/{id}")
    public ResponseEntity<?> getTesterStats(@PathVariable Long id) {
        Map<String, Object> testerStats= userService.getTesterStats(id);
        System.out.println(testerStats);
        return ResponseEntity.ok(testerStats);
    }
    @GetMapping("/testerstats")
    public ResponseEntity<?> getTesterStats() {
        List<?> testersStats= userService.getAllTesterStats();
        System.out.println(testersStats);
        return ResponseEntity.ok(testersStats);
    }


}