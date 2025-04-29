package com.projet.pp.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.projet.pp.dto.TacheDTO;
import com.projet.pp.model.Tache;
import com.projet.pp.model.TacheAttachment;
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
@CrossOrigin(origins = "*")
public class TacheController {

    @Autowired private TacheService tacheService;
    private static final String API = "/api";

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
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    /**
     * Supprime une tâche existante.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tacheService.deleteTache(id);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/attachments/{attId}")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long attId) throws IOException {
        Resource resource = tacheService.loadAttachmentAsResource(attId);
        String contentType = Files.probeContentType(Paths.get(resource.getURI()));
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                // passez de "attachment" à "inline" pour autoriser l'affichage en ligne
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/free")
    public List<TacheDTO> freeTasks() {
        return tacheService.getUnassignedTasks().stream()
                .map(t -> TacheDTO.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .status(t.getStatus().name())
                        .deadline(t.getDeadline())
                        .creationDate(t.getCreationDate())
                        .assignedTo(
                                t.getAssignedTo().stream()
                                        .map(u-> new TacheDTO.SimpleUser(u.getId(),u.getPrenom(),u.getNom()))
                                        .toList()
                        )
                        .build()
                ).toList();
    }

    /** 2) Assignation d’une tâche à un projet */
    @PutMapping("/{id}/assignProject")
    public ResponseEntity<Void> assignProject(
            @PathVariable Long id,
            @RequestParam Long projectId
    ) {
        tacheService.assignToProject(id, projectId);
        return ResponseEntity.ok().build();
    }
}
