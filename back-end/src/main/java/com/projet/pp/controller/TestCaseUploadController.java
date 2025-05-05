package com.projet.pp.controller;

import com.projet.pp.model.UploadedTestCase;
import com.projet.pp.service.TestCaseUploadService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

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

    @GetMapping("/uploads")
    public ResponseEntity<List<UploadedTestCase>> list(@PathVariable("pid") Long pid) {
        return ResponseEntity.ok(service.listByProject(pid));
    }

    /** Télécharger un fichier uploadé */
    @GetMapping("/uploads/{id}/download")
    public ResponseEntity<Resource> download(
            @PathVariable("pid") Long pid,
            @PathVariable("id")  Long uploadId
    ) throws MalformedURLException {
        Resource resource = service.loadAsResource(pid, uploadId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    /** Supprimer un fichier uploadé */
    @DeleteMapping("/uploads/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable("pid") Long pid,
            @PathVariable("id") Long uploadId
    ) {
        service.delete(pid, uploadId);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/uploads/zip")
    public void downloadAllAsZip(
            @PathVariable("pid") Long pid,
            HttpServletResponse response
    ) throws IOException {
        // Nom du zip
        String zipFilename = "test-cases-" + pid + ".zip";

        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/zip");
        response.setHeader("Content-Disposition",
                "attachment; filename=\"" + zipFilename + "\"");

        try (ZipOutputStream zos = new ZipOutputStream(response.getOutputStream())) {
            service.listByProject(pid).forEach(utc -> {
                Path file = Paths.get(utc.getFilePath());
                if (Files.exists(file)) {
                    try (InputStream is = Files.newInputStream(file)) {
                        ZipEntry entry = new ZipEntry(utc.getOriginalFilename());
                        zos.putNextEntry(entry);
                        is.transferTo(zos);
                        zos.closeEntry();
                    } catch (IOException e) {
                        // log et continuer
                    }
                }
            });
            zos.finish();
        }
    }
}