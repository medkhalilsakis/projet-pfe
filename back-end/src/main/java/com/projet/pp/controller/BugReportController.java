// src/main/java/com/projet/pp/controller/BugReportController.java
package com.projet.pp.controller;

import com.projet.pp.model.BugReport;
import com.projet.pp.service.BugReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/projects/{pid}/bugs")
public class BugReportController {

    @Autowired private BugReportService svc;

    /** Reporter un bug avec pièces‑jointes */
    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<BugReport> reportBug(
            @PathVariable("pid") Long projectId,
            @RequestParam("level") String level,
            @RequestParam("description") String description,
            @RequestParam(value="suggestions", required=false) String suggestions,
            @RequestPart(name="attachments", required=false) MultipartFile[] attachments
    ) {
        try {
            BugReport saved = svc.report(projectId, level, description, suggestions, attachments);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    /** Lister les bugs d’un projet */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<BugReport>> listBugs(@PathVariable("pid") Long projectId) {
        return ResponseEntity.ok(svc.listByProject(projectId));
    }

    /** Télécharger une pièce‑jointe de bug */
    @GetMapping(path="/attachments/{filename}", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<Resource> downloadAttachment(@PathVariable String filename) {
        Resource file = svc.loadAttachment(filename);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(file);
    }
}
