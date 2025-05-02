package com.projet.pp.service;

import com.projet.pp.model.PauseAttachment;
import com.projet.pp.model.ProjectPause;
import com.projet.pp.repository.PauseAttachmentRepository;
import com.projet.pp.repository.ProjectPauseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class ProjectPauseService {

    private final ProjectPauseRepository pauseRepo;
    private final PauseAttachmentRepository attachRepo;

    // Dossier de stockage des pièces jointes
    private final Path pauseStorage = Paths.get("uploads/pauses").toAbsolutePath().normalize();

    @Autowired
    public ProjectPauseService(ProjectPauseRepository pauseRepo,
                               PauseAttachmentRepository attachRepo) throws IOException {
        this.pauseRepo = pauseRepo;
        this.attachRepo = attachRepo;
        Files.createDirectories(pauseStorage);
    }

    @Transactional
    public ProjectPause createPause(ProjectPause pause) {
        return pauseRepo.save(pause);
    }

    /** Stocke un fichier joint et le lie à la pause */
    @Transactional
    public void storePauseAttachment(ProjectPause pause, MultipartFile file) {
        try {
            String ext = "";
            String original = file.getOriginalFilename();
            if (original != null && original.contains(".")) {
                ext = original.substring(original.lastIndexOf('.'));
            }
            String filename = UUID.randomUUID() + ext;
            Path target = pauseStorage.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            PauseAttachment attach = PauseAttachment.builder()
                    .pause(pause)
                    .filename(original != null ? original : filename)
                    .path(target.toString())
                    .build();

            attachRepo.save(attach);
            pause.getAttachments().add(attach);

        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la sauvegarde de la pièce jointe", e);
        }
    }
}