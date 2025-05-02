package com.projet.pp.controller;

import com.projet.pp.model.Project;
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
@RequestMapping("/api/assignments")
public class TesterAssignmentController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private TesterAssignmentService service;

    // 1) Projets en attente (status = 1)
    @GetMapping("/pending-projects")
    public List<Project> pending() {
        return service.getPendingProjects();
    }

    // 2) Testeurs avec nombre de projets en cours
    @GetMapping("/testers")
    public List<Map<String,Object>> testers() {
        return service.getAllTesters().stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getPrenom() + " " + u.getNom());
            map.put("inProgressCount", service.countInProgress(u.getId()));
            return map;
        }).toList();
    }


    // 3) Assignation — on récupère superviseurId dans le body
    @PostMapping("/assign")
    public ResponseEntity<?> assign(@RequestBody Map<String,Long> body) {
        try {
            Long projectId = body.get("projectId");
            Long testeurId = body.get("testeurId");
            Long superviseurId = body.get("superviseurId");
            service.assignTester(projectId, testeurId, superviseurId);
            return ResponseEntity.ok("Testeur assigné");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }



    @DeleteMapping("/remove/{assignmentId}")
    public ResponseEntity<?> removeTester(@PathVariable Long assignmentId) {
        service.removeTester(assignmentId);
        return ResponseEntity.ok("Testeur retiré");
    }

    // 5) Modifier une affectation
    @PutMapping("/update")
    public ResponseEntity<?> updateTester(@RequestBody Map<String, Long> body) {
        Long assignmentId = body.get("assignmentId");
        Long newTesterId = body.get("newTesterId");
        service.updateTester(assignmentId, newTesterId);
        return ResponseEntity.ok("Testeur modifié");
    }

    // 6) Interrompre la phase de test pour un projet
    @PostMapping("/interrupt/{projectId}")
    public ResponseEntity<?> interruptPhase(@PathVariable Long projectId) {
        service.interruptTestingPhase(projectId);
        return ResponseEntity.ok("Phase de test interrompue. Projet clôturé.");
    }


    @PostMapping("/resume/{projectId}")
    public ResponseEntity<?> resumeTestingPhase(@PathVariable Long projectId, @RequestBody Map<String, Object> body) {
        Long superviseurId = ((Number) body.get("superviseurId")).longValue();
        // On attend dans le body un tableau de testeurIds sous forme de nombres
        List<Integer> testerIdsInt = (List<Integer>) body.get("testerIds");
        List<Long> testerIds = testerIdsInt.stream().map(Integer::longValue).toList();
        service.resumeTestingPhase(projectId, testerIds, superviseurId);
        return ResponseEntity.ok("Phase de testing relancée pour le projet");
    }

    @GetMapping("/closed-projects")
    public List<Project> closed() {
        return service.getProjectsByStatuses(Arrays.asList(55, 99));
    }

    @PostMapping("/pause/{projectId}")
    public ResponseEntity<?> pause(@PathVariable Long projectId, @RequestParam Long supervisorId, @RequestParam String reason, @RequestParam(required=false) MultipartFile[] files) {
        service.pauseTestingPhase(projectId, supervisorId, reason, files);
        return ResponseEntity.ok("Phase de test mise en pause");
    }

    @PostMapping("/{projectId}/archive")
    public ResponseEntity<String> archive(@PathVariable Long projectId) {
        projectService.archiveProject(projectId);
        return ResponseEntity.ok("Projet archivé");
    }

    @GetMapping("/testing-projects")
    public List<Project> testingProjects() {
        return service.getTestingProjects();
    }
}
