package com.projet.pp.service;

import com.projet.pp.model.Project;
import com.projet.pp.model.UploadedTestCase;
import com.projet.pp.model.User;
import com.projet.pp.repository.ProjectRepository;
import com.projet.pp.repository.UploadedTestCaseRepository;
import com.projet.pp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class TestCaseUploadService {

    private final Path baseStorage = Paths.get("uploads/test-cases").toAbsolutePath().normalize();

    @Autowired
    private UploadedTestCaseRepository repo;
    @Autowired private ProjectRepository projectRepo;
    @Autowired private UserRepository userRepo;

    public TestCaseUploadService() {
        try {
            Files.createDirectories(baseStorage);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le répertoire test-cases.", e);
        }
    }

    @Transactional
    public UploadedTestCase store(Long projectId, Long userId, MultipartFile file) throws IOException {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet introuvable"));
        User uploader = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        String filename = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = "";
        int dot = filename.lastIndexOf('.');
        if (dot >= 0) extension = filename.substring(dot);

        // Optionnel : vérifier l'extension autorisée
        List<String> allowed = List.of(".xlsx",".xml",".json",".csv",".txt",".docx",".pdf");
        if (!allowed.contains(extension.toLowerCase())) {
            throw new RuntimeException("Type de fichier non autorisé : " + extension);
        }

        // Créer un nom unique pour éviter collisions
        String storedName = UUID.randomUUID() + extension;
        Path target = baseStorage.resolve(storedName);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        UploadedTestCase utc = new UploadedTestCase();
        utc.setProject(project);
        utc.setUploader(uploader);
        utc.setOriginalFilename(filename);
        utc.setFilePath(target.toString());
        utc.setMimeType(file.getContentType());
        return repo.save(utc);
    }

    public Resource loadAsResource(Long projectId, Long uploadId) throws MalformedURLException {
        UploadedTestCase utc = repo.findById(uploadId)
                .orElseThrow(() -> new RuntimeException("Upload introuvable"));
        Path filePath = Paths.get(utc.getFilePath());
        return new UrlResource(filePath.toUri());
    }

    @Transactional
    public void delete(Long projectId, Long uploadId) {
        UploadedTestCase utc = repo.findById(uploadId)
                .orElseThrow(() -> new RuntimeException("Upload introuvable"));
        // Optionnel : vérifier projet
        // supprimer fichier disque
        try { Files.deleteIfExists(Paths.get(utc.getFilePath())); }
        catch (IOException e) { /* log */ }
        // supprimer bdd
        repo.delete(utc);
    }

    public List<UploadedTestCase> listByProject(Long projectId) {
        return repo.findByProjectId(projectId);
    }
}
