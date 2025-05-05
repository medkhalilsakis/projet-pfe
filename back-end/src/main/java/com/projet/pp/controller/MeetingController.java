// src/main/java/com/projet/pp/controller/MeetingController.java
package com.projet.pp.controller;

import com.projet.pp.dto.MeetingRequest;
import com.projet.pp.model.Meeting;
import com.projet.pp.service.MeetingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/projects/{pid}/meetings")
public class MeetingController {

    @Autowired private MeetingService svc;

    /** Planifier une réunion avec pièces‑jointes */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Meeting> schedule(
            @PathVariable("pid") Long projectId,
            @RequestPart("data") MeetingRequest data,
            @RequestPart(name="attachments", required = false) MultipartFile[] files
    ) {
        try {
            Meeting saved = svc.schedule(projectId, data, files);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);
        }
    }

    /** Lister toutes les réunions d’un projet */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Meeting>> list(@PathVariable("pid") Long projectId) {
        return ResponseEntity.ok(svc.findByProject(projectId));
    }

    /** Télécharger une pièce‑jointe */
    @GetMapping(path="/attachments/{filename}", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable String filename
    ) {
        Resource file = svc.loadAttachment(filename);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .body(file);
    }
}
