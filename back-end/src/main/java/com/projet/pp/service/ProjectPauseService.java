package com.projet.pp.service;

import com.projet.pp.model.*;
import com.projet.pp.repository.PauseAttachmentRepository;
import com.projet.pp.repository.ProjectPauseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProjectPauseService {
    @Autowired
    private  ProjectPauseRepository pauseRepo;
    @Autowired
    private final PauseAttachmentRepository attachRepo;
    @Autowired
    private NotificationService notificationService ;
    // Dossier de stockage des pièces jointes
    private final Path pauseStorage = Paths.get("uploads/pauses").toAbsolutePath().normalize();

    @Autowired
    public ProjectPauseService(ProjectPauseRepository pauseRepo,
                               PauseAttachmentRepository attachRepo) throws IOException {
        this.pauseRepo = pauseRepo;
        this.attachRepo = attachRepo;
        Files.createDirectories(pauseStorage);
    }
    public List<ProjectPause> getByProjects(List<Project> projects) {
        return pauseRepo.findByProjectIn(projects);
    }

    public Optional<ProjectPause> getById(long pauseProjectId){
        return pauseRepo.findById(pauseProjectId);
    }

    @Transactional
    public ProjectPause createPause(ProjectPause pause) {
        return pauseRepo.save(pause);
    }

    @Transactional
    public ProjectPause createPauseByproject(Project project, User superviser) {
        ProjectPause projectPause=new ProjectPause(
                null,
                project,
                superviser,
                "choix d'un superviseur",
                LocalDateTime.now(),
                null
        );
        Notification noti = new Notification(
                null,
                project.getUser(),
                "Projet mis en pause",
                "Le superviseur " +superviser.getNom()+" " + superviser.getPrenom()+"a mis votre projet" + project.getName() + " en pause ",
                false,
                LocalDateTime.now(),
                project,
                null,
                null,
                null
        );
        notificationService.createNoti(noti);
        System.out.println("aaaaaaaaaaaaaaaaaaaaaaaa" + projectPause);
        return pauseRepo.save(projectPause);
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