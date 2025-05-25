package com.projet.pp.controller;

import com.projet.pp.dto.NoteDecisionDto;
import com.projet.pp.model.NoteDecision;
import com.projet.pp.service.NoteDecisionService;
import com.projet.pp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notes-decisions")
@CrossOrigin(origins = "http://localhost:4200")
public class NoteDecisionController {

    private final NoteDecisionService service;
    private final UserService userService;

    @Autowired
    public NoteDecisionController(
            NoteDecisionService service,
            UserService userService
    ) {
        this.service     = service;
        this.userService = userService;
    }

    @GetMapping
    public List<NoteDecision> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<NoteDecision> getById(@PathVariable Integer id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Création en multipart/form-data */
    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public NoteDecisionDto create(
            @RequestPart("data") NoteDecisionDto dto,
            @RequestPart(name="files", required=false) MultipartFile[] files
    ) {
        NoteDecision saved = service.createFromDto(dto, files);
        return toDto(saved);
    }

    @GetMapping("/download/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        try {
            Path file = Paths.get("uploads/notes").resolve(filename).normalize();
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            // Tenter de deviner le content-type
            String contentType = Files.probeContentType(file);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    /** Mise à jour en multipart/form-data */
    @PutMapping(
            path="/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public NoteDecisionDto update(
            @PathVariable Integer id,
            @RequestPart("data") NoteDecisionDto dto,
            @RequestPart(name="files", required=false) MultipartFile[] files
    ) {
        NoteDecision updated = service.updateFromDto(id, dto, files);
        return toDto(updated);
    }


    private NoteDecisionDto toDto(NoteDecision n) {
        return NoteDecisionDto.builder()
                .id(n.getId())
                .typeNote(n.getTypeNote())
                .titre(n.getTitre())
                .contenu(n.getContenu())
                .statut(n.getStatut())
                .superviseurId(
                        n.getSuperviseur() != null
                                ? n.getSuperviseur().getId().intValue()   // ← cast Long → int
                                : null
                )
                .remarque(n.getRemarque())
                .fichierJoint(n.getFichierJoint())
                .build();
    }



    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
