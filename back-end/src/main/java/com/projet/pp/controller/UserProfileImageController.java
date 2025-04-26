// src/main/java/com/projet/pp/controller/UserProfileImageController.java
package com.projet.pp.controller;

import java.io.IOException;
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
        return img != null
                ? ResponseEntity.ok(img)
                : ResponseEntity.notFound().build();
    }

    @GetMapping(path = "/raw")
    public ResponseEntity<Resource> raw(@PathVariable Long userId) throws Exception {
        UserProfileImage img = svc.getMeta(userId);
        if (img == null) return ResponseEntity.notFound().build();
        Path p = Paths.get(img.getFilePath());
        Resource r = new UrlResource(p.toUri());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(img.getMimeType()))
                .body(r);
    }
}
