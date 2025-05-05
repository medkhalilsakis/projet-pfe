package com.projet.pp.controller;

import com.projet.pp.model.UploadedTestCase;
import com.projet.pp.service.TestCaseUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{pid}/test-cases")
public class TestCaseUploadController {

    @Autowired
    private TestCaseUploadService service;

    /** Upload d’un unique cas de test (fichier) */
    @PostMapping("/upload")
    public ResponseEntity<?> upload(
            @PathVariable("pid") Long projectId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId
    ) {
        try {
            UploadedTestCase utc = service.store(projectId, userId, file);
            return ResponseEntity.ok(utc);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erreur upload: " + e.getMessage());
        }
    }

    /** Liste des fichiers uploadés pour un projet */
    @GetMapping("/uploads")
    public ResponseEntity<List<UploadedTestCase>> list(@PathVariable("pid") Long pid) {
        return ResponseEntity.ok(service.listByProject(pid));
    }
}