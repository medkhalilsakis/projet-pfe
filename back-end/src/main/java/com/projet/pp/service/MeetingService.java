// src/main/java/com/projet/pp/service/MeetingService.java
package com.projet.pp.service;

import com.projet.pp.dto.MeetingRequest;
import com.projet.pp.model.Meeting;
import com.projet.pp.model.Project;
import com.projet.pp.model.User;
import com.projet.pp.repository.MeetingRepository;
import com.projet.pp.repository.ProjectRepository;
import com.projet.pp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class MeetingService {

    private final Path storageDir = Paths.get("uploads/meetings").toAbsolutePath().normalize();

    @Autowired private MeetingRepository meetingRepo;
    @Autowired private ProjectRepository projectRepo;
    @Autowired private UserRepository userRepo;

    public MeetingService() throws IOException {
        Files.createDirectories(storageDir);
    }

    @Transactional
    public Meeting schedule(Long projectId, MeetingRequest req, MultipartFile[] attachments) throws IOException {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet introuvable"));
        Meeting m = new Meeting();
        m.setSubject(req.getSubject());
        m.setDate(req.getDate());
        m.setParticipants(req.getParticipants());
        m.setDescription(req.getDescription());
        m.setProject(project);

        // stocker les pièces‑jointes et conserver leurs noms dans l'entity
        List<String> stored = new ArrayList<>();
        if (attachments != null) {
            for (MultipartFile f : attachments) {
                String ext = f.getOriginalFilename().contains(".")
                        ? f.getOriginalFilename().substring(f.getOriginalFilename().lastIndexOf('.'))
                        : "";
                String filename = System.currentTimeMillis() + "_" + java.util.UUID.randomUUID() + ext;
                Path target = storageDir.resolve(filename);
                Files.copy(f.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
                stored.add(filename);
            }
        }
        m.setAttachments(stored);
        return meetingRepo.save(m);
    }

    public List<Meeting> findByProject(Long projectId) {
        return meetingRepo.findByProjectId(projectId);
    }

    /** Renvoie la ressource d’une pièce‑jointe */
    public Resource loadAttachment(String filename) {
        try {
            Path file = storageDir.resolve(filename).normalize();
            Resource r = new UrlResource(file.toUri());
            if (r.exists() || r.isReadable()) return r;
            else throw new RuntimeException("Fichier non lisible: " + filename);
        } catch (MalformedURLException e) {
            throw new RuntimeException("URL invalide: " + filename, e);
        }
    }
}
