package com.projet.pp.controller;

import com.projet.pp.dto.InvitedUserDTO;
import com.projet.pp.dto.ProjectFileNode;
import com.projet.pp.dto.ProjectStatsDTO;
import com.projet.pp.model.Project;
import com.projet.pp.model.ProjectFile;
import com.projet.pp.model.ProjectInvitedUser;
import com.projet.pp.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        List<Project> projects = projectService.getAllProjects();
        return ResponseEntity.ok(projects);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadProject(@RequestParam("files") MultipartFile[] files,
                                           @RequestParam(value = "decompress", defaultValue = "false") boolean decompress,
                                           @RequestParam("userId") Long userId) {
        try {
            Long projectId = projectService.uploadProject(files, decompress, userId);
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

    @GetMapping("/{projectId}/files")
    public ResponseEntity<List<ProjectFile>> getProjectFiles(
            @PathVariable Long projectId,
            @RequestParam(value = "parentId", required = false) Long parentId) {
        try {
            List<ProjectFile> files = projectService.getFilesByProjectIdAndParentId(projectId, parentId);
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            e.printStackTrace();
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
    public ResponseEntity<ProjectFile> createFolder(
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

    // Inviter un utilisateur (ajoute une ligne dans project_invited_users)
    @PostMapping("/{projectId}/invite")
    public ResponseEntity<?> inviteUser(
            @PathVariable Long projectId,
            @RequestBody Map<String, String> body) {
        try {
            Long userId = Long.valueOf(body.get("userId"));
            String status = body.get("status"); // Par exemple: "pending", "accepted", etc.
            projectService.inviteUser(projectId, userId, status);
            return ResponseEntity.ok("Utilisateur invité avec succès");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l'invitation : " + e.getMessage());
        }
    }


    // Retirer un utilisateur invité
    @DeleteMapping("/{projectId}/invite/{userId}")
    public ResponseEntity<?> removeInvitedUser(
            @PathVariable Long projectId,
            @PathVariable Long userId) {
        try {
            projectService.removeInvitedUser(projectId, userId);
            return ResponseEntity.ok("Utilisateur retiré avec succès");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors du retrait de l'invitation : " + e.getMessage());
        }
    }


    @GetMapping("/{projectId}")
    public ResponseEntity<?> getProjectById(@PathVariable Long projectId) {
        try {
            Project project = projectService.getProjectById(projectId);
            return ResponseEntity.ok(project);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }


    @PutMapping(
            path = "/{projectId}/files/{fileId}/content",
            consumes = MediaType.TEXT_PLAIN_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public ResponseEntity<String> updateFileContent(
            @PathVariable Long projectId,
            @PathVariable Long fileId,
            @RequestBody String newContent) throws IOException {
        // (Optionnel) vérifier que ce fichier appartient bien au projetId passé
        projectService.updateFileContent(fileId, newContent);
        return ResponseEntity
                .ok("Contenu mis à jour avec succès");
    }

    @PutMapping("/{projectId}/visibility")
    public ResponseEntity<String> updateVisibility(
            @PathVariable Long projectId,
            @RequestBody Map<String, String> body) {
        try {
            // Vérification du body pour s'assurer que les valeurs sont correctement extraites
            Long userId = Long.valueOf(body.get("userId"));
            String vis = body.get("visibilite");      // "public" ou "privée"
            Integer status = Integer.valueOf(body.get("status")); // 1 ou 0

            // Vérification des valeurs extraites
            if (userId == null || vis == null || status == null) {
                throw new RuntimeException("Paramètres manquants ou invalides.");
            }

            // Mise à jour de la visibilité du projet
            projectService.updateVisibility(projectId, userId, vis);

            return ResponseEntity.ok("Visibilité mise à jour avec succès");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }



    @GetMapping("/{projectId}/stats")
    public ResponseEntity<ProjectStatsDTO> getStats(@PathVariable Long projectId) {
        ProjectStatsDTO stats = projectService.getProjectStats(projectId);
        return ResponseEntity.ok(stats);
    }

    // Dans ProjectController.java
    @GetMapping("/{projectId}/invite")
    public ResponseEntity<List<InvitedUserDTO>> getInvitedUsers(
            @PathVariable Long projectId) {

        List<InvitedUserDTO> invites =
                projectService.getInvitedUsers(projectId);
        return ResponseEntity.ok(invites);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{projectId}/restart")
    public ResponseEntity<Void> restartProject(@PathVariable Long projectId) {
        projectService.restartTestPhase(projectId);
        return ResponseEntity.ok().build();
    }


    @GetMapping("/{projectId}/pause")
    public ResponseEntity<Map<String,String>> getLastPause(@PathVariable Long projectId) {
        return projectService.findLastPause(projectId)
                .map(pause -> ResponseEntity.ok(Map.of("reason", pause.getReason())))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{projectId}/closure")
    public ResponseEntity<Map<String,String>> getLastClosure(@PathVariable Long projectId) {
        return projectService.findLastClosure(projectId)
                .map(clo -> ResponseEntity.ok(Map.of("reason", clo.getReason())))
                .orElse(ResponseEntity.notFound().build());
    }


    @GetMapping("/{projectId}/files/export")
    public ResponseEntity<Resource> exportProject(@PathVariable Long projectId) throws IOException {
        Resource zip = projectService.downloadProjectContent(projectId);
        String filename = "project-" + projectId + ".zip";
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .body(zip);
    }
}
