package com.projet.pp.controller;

import com.projet.pp.dto.ProjectFileNode;
import com.projet.pp.model.Project;
import com.projet.pp.model.ProjectFile;
import com.projet.pp.service.ProjectService;
import com.projet.pp.service.TacheService;
import com.projet.pp.service.TesterAssignmentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private TesterAssignmentService testerAssignmentService;
    @Autowired
    private TacheService tacheService;

    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        List<Project> projects = projectService.getAllProjects();
        return ResponseEntity.ok(projects);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadProject(@RequestParam("files") MultipartFile[] files,
                                           @RequestParam(value = "taskId", required = false) Long taskId,
                                           @RequestParam(value = "decompress", defaultValue = "false") boolean decompress,
                                           @RequestParam("userId") Long userId) {
        try {
            Long projectId = projectService.uploadProject(files, decompress, userId);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Fichiers uploadés avec succès");
            response.put("projectId", projectId);
            System.out.println("task" + taskId);
            if (taskId != null) {
                Project project = projectService.getProjectById(projectId);
                tacheService.linkTaskToProject(taskId, project);
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l'upload : " + e.getMessage());
        }
    }

    // Endpoint pour finaliser le projet, sans utiliser de DTO dédié
    @PostMapping("/commit")
    public ResponseEntity<?> commitProject(
            @RequestParam("projectId") Long projectId,
            @RequestBody Map<String, String> commitData) {
        try {
            String name = commitData.get("name");
            String type = commitData.get("type");
            String description = commitData.get("description"); // Optionnel
            String visibilite = commitData.get("visibilite");
            String status = commitData.get("status");

            projectService.commitProject(projectId, name, type, description, visibilite, status);
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
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body("Erreur lors de la récupération des projets : " + e.getMessage());
        }
    }
    @GetMapping("/tester/{userId}")
    public ResponseEntity<?> getProjectsByTester(@PathVariable("userId") Long userId) {
        try {
            List<Long> ids = testerAssignmentService.getProjectIdsByTesterId(userId);
            List<Project> projects = new ArrayList<>();

            for (Long id : ids) {
                Project project = projectService.getProjectById(id); // suppose que cette méthode existe
                if (project != null) {
                    projects.add(project);
                }
            }

            return ResponseEntity.ok(projects);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body("Erreur lors de la récupération des projets : " + e.getMessage());
        }
    }

    @GetMapping("/{projectId}/files")
    public ResponseEntity<List<ProjectFile>> getProjectFiles(
            @PathVariable Long projectId,
            @RequestParam(value = "parentId", required = false) Long parentId) {
        try {
            List<ProjectFile> files = projectService.getFilesByProjectIdAndParentId(projectId, parentId);
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{projectId}/files/tree")
    public ResponseEntity<?> getProjectFilesTree(@PathVariable("projectId") Long projectId) {
        try {
            List<ProjectFileNode> tree = projectService.buildProjectFileTree(projectId);
            return ResponseEntity.ok(tree);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la récupération de l'arbre des fichiers : " + e.getMessage());
        }
    }

    @GetMapping("/{projectId}/files/{fileId}/content")
    public ResponseEntity<String> getFileContent(@PathVariable Long projectId, @PathVariable Long fileId) throws IOException {
        String content = projectService.getFileContent(fileId);
        return ResponseEntity.ok(content);
    }


    /**
     * PUT /api/projects/{projectId}/files/{fileId}/content
     * Met à jour le contenu textuel du fichier.
     */
    @PutMapping("/{projectId}/files/{fileId}/content")
    public ResponseEntity<?> updateFileContent(
            @PathVariable Long projectId,
            @PathVariable Long fileId,
            @RequestBody String newContent) {
        try {
            projectService.updateFileContent(fileId, newContent);
            return ResponseEntity.ok("Contenu mis à jour avec succès");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la mise à jour : " + e.getMessage());
        }
    }

    /**
     * DELETE /api/projects/{projectId}/files/{fileId}
     * Supprime le fichier à la fois du disque et de la base.
     */
    @DeleteMapping("/{projectId}/files/{fileId}")
    public ResponseEntity<?> deleteFile(
            @PathVariable Long projectId,
            @PathVariable Long fileId) {
        try {
            projectService.deleteFile(fileId);
            return ResponseEntity.ok("Fichier supprimé avec succès");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la suppression : " + e.getMessage());
        }
    }


    @PostMapping("/{projectId}/files/folder")
    public ResponseEntity<?> createFolder(
            @PathVariable Long projectId,
            @RequestBody Map<String,String> body) throws IOException {
        Long parentId = body.containsKey("parentId")
                ? Long.parseLong(body.get("parentId")) : null;
        String name = body.get("name");
        ProjectFile pf = projectService.createFolder(projectId, parentId, name);
        return ResponseEntity.status(HttpStatus.CREATED).body(pf);
    }

    // Upload de nouveaux fichiers dans un dossier existant
    @PostMapping("/{projectId}/files/upload")
    public ResponseEntity<?> uploadFiles(
            @PathVariable Long projectId,
            @RequestParam(value="parentId", required=false) Long parentId,
            @RequestParam("files") MultipartFile[] files) throws IOException {
        List<ProjectFile> saved = projectService.addFiles(projectId, parentId, files);
        return ResponseEntity.ok(saved);
    }
    @GetMapping("/stats")
    public ResponseEntity<Map<String,Object>> getProjectStats() {
        Map<String, Long> toTesting = Map.of(
                "week",  projectService.getToTestingWeek(),
                "month", projectService.getToTestingMonth(),
                "year",  projectService.getToTestingYear()
        );

        Map<String, Object> root = new LinkedHashMap<>();
        root.put("week",            projectService.getWeek());
        root.put("month",           projectService.getMonth());
        root.put("year",            projectService.getYear());
        root.put("toTesting",       toTesting);
        System.out.println(root);
        return ResponseEntity.ok(root);
    }

    @GetMapping("/stats/{id}")
    public ResponseEntity<Map<String,Object>> getProjectStats(@PathVariable Long id) {
        Map<String, Long> toTesting = Map.of(
                "week",  projectService.getToTestingWeekAndUserId(id),
                "month", projectService.getToTestingMonthAndUserId(id),
                "year",  projectService.getToTestingYearAndUserId(id)
        );

        Map<String, Object> root = new LinkedHashMap<>();
        root.put("week",            projectService.getWeekAndUserId( id));
        root.put("month",           projectService.getMonthAndUserId(id));
        root.put("year",            projectService.getYearAndUserId(id));
        root.put("toTesting",       toTesting);
        System.out.println(root);
        return ResponseEntity.ok(root);
    }
    @GetMapping("/stats/tester/{id}")
    public ResponseEntity<Map<String,Object>> getProjectTesterStats(@PathVariable Long id) {
        Map<String, Long> toTesting = Map.of(
                "week",  projectService.getToTestingWeekAndTesteurId(id),
                "month", projectService.getToTestingMonthAndTesteurId(id),
                "year",  projectService.getToTestingYearAndTesteurId(id)
        );

        Map<String, Object> root = new LinkedHashMap<>();
        root.put("week",            projectService.getWeekAndTesteurId( id));
        root.put("month",           projectService.getMonthAndTesteurId(id));
        root.put("year",            projectService.getYearAndTesteurId(id));
        root.put("toTesting",       toTesting);
        System.out.println(root);
        return ResponseEntity.ok(root);
    }

}
