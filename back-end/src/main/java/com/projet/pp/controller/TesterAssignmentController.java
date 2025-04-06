package com.projet.pp.controller;

import com.projet.pp.model.Project;
import com.projet.pp.service.TesterAssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assignments")
public class TesterAssignmentController {

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
    public ResponseEntity<?> assign(@RequestBody Map<String, Long> body) {
        Long projectId     = body.get("projectId");
        Long testeurId     = body.get("testeurId");
        Long superviseurId = body.get("superviseurId");  // ← depuis Angular

        service.assignTester(projectId, testeurId, superviseurId);
        return ResponseEntity.ok("Testeur assigné");
    }
}
