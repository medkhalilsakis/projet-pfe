// src/main/java/com/projet/pp/service/BugReportService.java
package com.projet.pp.service;

import com.projet.pp.model.BugReport;
import com.projet.pp.model.Project;
import com.projet.pp.repository.BugReportRepository;
import com.projet.pp.repository.ProjectRepository;
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
public class BugReportService {

    private final Path storageDir = Paths.get("uploads/bug-reports").toAbsolutePath().normalize();

    @Autowired private BugReportRepository bugRepo;
    @Autowired private ProjectRepository projectRepo;

    public BugReportService() throws IOException {
        Files.createDirectories(storageDir);
    }

    @Transactional
    public BugReport report(Long projectId,
                            String level,
                            String description,
                            String suggestions,
                            MultipartFile[] attachments) throws IOException {

        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet introuvable"));

        BugReport bug = new BugReport();
        bug.setLevel(level);
        bug.setDescription(description);
        bug.setSuggestions(suggestions);
        bug.setProject(project);

        // Stockage des pièces jointes et collecte des noms
        List<String> stored = new ArrayList<>();
        if (attachments != null) {
            for (MultipartFile file : attachments) {
                String orig = file.getOriginalFilename();
                String ext = orig != null && orig.contains(".")
                        ? orig.substring(orig.lastIndexOf('.')) : "";
                String filename = System.currentTimeMillis() + "_" + java.util.UUID.randomUUID() + ext;
                Path target = storageDir.resolve(filename);
                Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
                stored.add(filename);
            }
        }
        bug.setAttachments(stored);

        return bugRepo.save(bug);
    }

    public List<BugReport> listByProject(Long projectId) {
        return bugRepo.findByProjectId(projectId);
    }

    /** Récupération d’une pièce jointe en Resource */
    public Resource loadAttachment(String filename) {
        try {
            Path file = storageDir.resolve(filename).normalize();
            Resource res = new UrlResource(file.toUri());
            if (res.exists() && res.isReadable()) return res;
            throw new RuntimeException("Impossible de lire le fichier: " + filename);
        } catch (MalformedURLException e) {
            throw new RuntimeException("URL invalide: " + filename, e);
        }
    }
}
