package com.projet.pp.controller;

import com.projet.pp.model.Project;
import com.projet.pp.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadProject(@RequestParam("files") MultipartFile[] files,
                                           @RequestParam(value = "decompress", defaultValue = "false") boolean decompress,
                                           @RequestParam("userId") Long userId) {
        try {
            // Appel au service qui gère l'upload et retourne l'ID du projet créé
            Long projectId = projectService.uploadProject(files, decompress, userId);

            // Création d'une réponse JSON avec un message et l'ID du projet
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Fichiers uploadés avec succès");
            response.put("projectId", projectId);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l'upload : " + e.getMessage());
        }
    }

    // Endpoint pour le commit final du projet
    @PostMapping("/commit")
    public ResponseEntity<?> commitProject(
            @RequestParam("projectId") Long projectId,
            @RequestBody Map<String, String> commitData) {
        try {
            // Extraction des champs depuis le Map
            String name = commitData.get("name");
            String type = commitData.get("type");
            String description = commitData.get("description"); // Peut être null
            String visibilite = commitData.get("visibilite");

            projectService.commitProject(projectId, name, type, description, visibilite);
            return ResponseEntity.ok("Projet finalisé avec succès");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors du commit : " + e.getMessage());
        }
    }


    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getProjectsByUser(@PathVariable("userId") Long userId) {
        try {
            List<Project> projects = projectService.getProjectsByUserId(userId);
            return ResponseEntity.ok(projects);
        } catch(Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la récupération des projets : " + e.getMessage());
        }
    }
}
