// src/main/java/com/projet/pp/controller/TacheController.java
package com.projet.pp.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.projet.pp.dto.TacheDTO;
import com.projet.pp.model.Tache;
import com.projet.pp.service.TacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/taches")
public class TacheController {

    @Autowired private TacheService tacheService;

    /** Liste (summary) */
    @GetMapping
    public List<TacheDTO> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Tache.Status status,
            @RequestParam(required = false) Long assignedTo
    ) {
        return tacheService.search(q, status, assignedTo).stream()
                .map(t -> TacheDTO.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .outils(t.getOutils())
                        .status(t.getStatus().name())
                        .deadline(t.getDeadline())
                        .creationDate(t.getCreationDate())
                        .assignedTo(t.getAssignedTo().stream()
                                .map(u -> TacheDTO.SimpleUser.builder()
                                        .id(u.getId())
                                        .prenom(u.getPrenom())
                                        .nom(u.getNom())
                                        .build())
                                .toList())
                        .assignedBy(TacheDTO.SimpleUser.builder()
                                .id(t.getAssignedBy().getId())
                                .prenom(t.getAssignedBy().getPrenom())
                                .nom(t.getAssignedBy().getNom())
                                .build())
                        .build())
                .toList();
    }

    /** Détail complet */
    @GetMapping("/{id}")
    public ResponseEntity<TacheDTO> detail(@PathVariable Long id) {
        return tacheService.getTacheById(id)
                .map(t -> TacheDTO.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .description(t.getDescription())
                        .outils(t.getOutils())
                        .status(t.getStatus().name())
                        .deadline(t.getDeadline())
                        .creationDate(t.getCreationDate())
                        .assignedTo(t.getAssignedTo().stream()
                                .map(u -> TacheDTO.SimpleUser.builder()
                                        .id(u.getId())
                                        .prenom(u.getPrenom())
                                        .nom(u.getNom())
                                        .build())
                                .toList())
                        .assignedBy(TacheDTO.SimpleUser.builder()
                                .id(t.getAssignedBy().getId())
                                .prenom(t.getAssignedBy().getPrenom())
                                .nom(t.getAssignedBy().getNom())
                                .build())
                        .attachments(t.getAttachments().stream()
                                .map(a -> TacheDTO.AttachmentDTO.builder()
                                        .id(a.getId())
                                        .fileName(a.getFileName())
                                        .fileType(a.getFileType())
                                        .build())
                                .toList())
                        .build())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Création (retourne un résumé) */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TacheDTO> create(
            @RequestPart("data") String dataJson,
            @RequestPart("projectPdf") MultipartFile projectPdf,
            @RequestPart(name="attachments", required=false) MultipartFile[] attachments
    ) throws IOException {
        // 1) désérialisation
        var mapper = new ObjectMapper();
        Map<String,Object> map = mapper.readValue(dataJson, new TypeReference<>(){});

        // 2) création
        Tache t = tacheService.create(map, projectPdf, attachments);

        // 3) build DTO résumé
        TacheDTO dto = TacheDTO.builder()
                .id(t.getId())
                .name(t.getName())
                .status(t.getStatus().name())
                .deadline(t.getDeadline())
                .creationDate(t.getCreationDate())
                .assignedTo(t.getAssignedTo().stream()
                        .map(u -> TacheDTO.SimpleUser.builder()
                                .id(u.getId())
                                .prenom(u.getPrenom())
                                .nom(u.getNom())
                                .build())
                        .toList())
                .assignedBy(TacheDTO.SimpleUser.builder()
                        .id(t.getAssignedBy().getId())
                        .prenom(t.getAssignedBy().getPrenom())
                        .nom(t.getAssignedBy().getNom())
                        .build())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    /** Suppression */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tacheService.deleteTache(id);
        return ResponseEntity.noContent().build();
    }

    /** Téléchargement d’une pièce jointe */
    @GetMapping("/attachments/{attId}")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long attId) throws IOException {
        Resource resource = tacheService.loadAttachmentAsResource(attId);
        String contentType = Files.probeContentType(Paths.get(resource.getURI()));
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    /** Assignation d’une tâche à un projet */
    @PutMapping("/{id}/assignProject")
    public ResponseEntity<Void> assignProject(
            @PathVariable Long id,
            @RequestParam Long projectId
    ) {
        tacheService.assignToProject(id, projectId);
        return ResponseEntity.ok().build();
    }


    /** Mise à jour complète d’une tâche */
    // src/main/java/com/projet/pp/controller/TacheController.java
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TacheDTO> update(
            @PathVariable Long id,
            @RequestPart("data") String dataJson,
            @RequestPart(name="projectPdf", required=false) MultipartFile projectPdf,
            @RequestPart(name="attachments", required=false) MultipartFile[] attachments,
            @RequestParam(name="removeAttIds", required=false) List<Long> removeAttIds
    ) throws IOException {
        // 1) parse JSON
        ObjectMapper mapper = new ObjectMapper();
        Map<String,Object> map = mapper.readValue(dataJson, new TypeReference<>(){});
        // 2) update via service
        Tache t = tacheService.update(id, map, projectPdf, attachments, removeAttIds);
        // 3) construire et renvoyer le DTO
        TacheDTO dto = TacheDTO.builder()
                .id(t.getId())
                .name(t.getName())
                .description(t.getDescription())
                .outils(t.getOutils())
                .status(t.getStatus().name())
                .deadline(t.getDeadline())
                .creationDate(t.getCreationDate())
                .assignedTo(t.getAssignedTo().stream()
                        .map(u -> TacheDTO.SimpleUser.builder()
                                .id(u.getId())
                                .prenom(u.getPrenom())
                                .nom(u.getNom()).build())
                        .toList())
                .assignedBy(TacheDTO.SimpleUser.builder()
                        .id(t.getAssignedBy().getId())
                        .prenom(t.getAssignedBy().getPrenom())
                        .nom(t.getAssignedBy().getNom()).build())
                .attachments(t.getAttachments().stream()
                        .map(a -> TacheDTO.AttachmentDTO.builder()
                                .id(a.getId())
                                .fileName(a.getFileName())
                                .fileType(a.getFileType())
                                .build())
                        .toList())
                .build();
        return ResponseEntity.ok(dto);
    }


    @GetMapping("/{id}/attachments/zip")
    public ResponseEntity<Resource> downloadAllAsZip(@PathVariable Long id) throws IOException {
        Resource zip = tacheService.getAllAttachmentsAsZip(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"tache-" + id + "-files.zip\"")
                .body(zip);
    }


}
