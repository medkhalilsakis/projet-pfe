// src/main/java/com/projet/pp/controller/UserProfileImageController.java
package com.projet.pp.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import com.projet.pp.model.UserProfileImage;
import com.projet.pp.service.UserProfileImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Paths;
import java.util.Map;

@RestController
@RequestMapping("/api/users/{userId}/profile-image")
public class UserProfileImageController {

    @Autowired private UserProfileImageService svc;

    private final Path defaultImagePath = Paths.get("uploads/users/user-avatar.png")
            .toAbsolutePath().normalize();

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> upload(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) {
        try {
            UserProfileImage uploaded = svc.upload(userId, file);
            return ResponseEntity.ok(uploaded);
        } catch (IOException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping(path = "/meta", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UserProfileImage> meta(@PathVariable Long userId) {
        UserProfileImage img = svc.getMeta(userId);
        if (img != null) {
            return ResponseEntity.ok(img);
        }
        // Sinon on renvoie un objet "factice" pointant vers l'image par défaut
        try {
            UserProfileImage def = new UserProfileImage();
            def.setFilePath(defaultImagePath.toString());
            def.setMimeType("image/png");
            def.setFileSize(Files.size(defaultImagePath));
            return ResponseEntity.ok(def);
        } catch (Exception ex) {
            // Si même la ressource par défaut manque, on renvoie 404
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping(path = "/raw")
    public ResponseEntity<Resource> raw(@PathVariable Long userId) {
        try {
            UserProfileImage img = svc.getMeta(userId);
            Path p;
            String mime;
            if (img != null) {
                p = Paths.get(img.getFilePath());
                mime = img.getMimeType();
            } else {
                // fallback vers l'image par défaut
                p = defaultImagePath;
                mime = "image/png";
            }
            Resource r = new UrlResource(p.toUri());
            if (!r.exists() || !r.isReadable()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(mime))
                    .body(r);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
