package com.projet.pp.service;

import com.projet.pp.model.Project;
import com.projet.pp.model.Tache;
import com.projet.pp.model.TacheAttachment;
import com.projet.pp.model.User;
import com.projet.pp.repository.ProjectRepository;
import com.projet.pp.repository.TacheAttachmentRepository;
import com.projet.pp.repository.TacheRepository;
import com.projet.pp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TacheService {

    @Autowired
    private TacheRepository tacheRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TacheAttachmentRepository attachmentRepository;

    @Autowired
    private ProjectRepository projectRepository;


    private final Path baseStorage = Paths.get("uploads/taches")
            .toAbsolutePath().normalize();

    public TacheService() throws IOException {
        Files.createDirectories(baseStorage);
    }

    public List<Tache> getAllTaches() {
        return tacheRepository.findAll();
    }

    public Optional<Tache> getTacheById(Long id) {
        return tacheRepository.findById(id);
    }

    public void deleteTache(Long id) {
        tacheRepository.deleteById(id);
    }

    public List<Tache> search(String q, Tache.Status status, Long assignedTo) {
        if (q != null && status != null && assignedTo != null) {
            return tacheRepository
                    .findByNameContainingIgnoreCaseAndStatusAndAssignedToId(q, status, assignedTo);
        }
        if (q != null) {
            return tacheRepository.findByNameContainingIgnoreCase(q);
        }
        if (status != null) {
            return tacheRepository.findByStatus(status);
        }
        if (assignedTo != null) {
            return tacheRepository.findByAssignedToId(assignedTo);
        }
        return tacheRepository.findAll();
    }

    @Transactional
    public Tache create(
            Map<String, Object> data,
            MultipartFile projectPdf,
            MultipartFile[] attachments
    ) throws IOException {
        Tache t = new Tache();
        t.setName((String) data.get("name"));
        t.setDescription((String) data.get("description"));
        t.setOutils((String) data.get("outils"));
        t.setCreationDate(LocalDate.parse((String) data.get("creationDate")));
        t.setDeadline(LocalDate.parse((String) data.get("deadline")));
        t.setStatus(Tache.Status.valueOf(((String) data.get("status")).toLowerCase()));

        // --- assignedBy (convertir toujours via toString) ---
        Long assignedById = Long.valueOf(data.get("assignedBy").toString());
        User assignedBy = userRepository.findById(assignedById)
                .orElseThrow(() -> new RuntimeException("Utilisateur assigné par non trouvé"));
        t.setAssignedBy(assignedBy);

        // --- assignedTo (Many-to-Many) avec conversion Number → long ---
        @SuppressWarnings("unchecked")
        List<Object> toIds = (List<Object>) data.get("assignedTo");

        Set<User> assignees = toIds.stream()
                .map(idObj -> {
                    if (idObj instanceof Number) {
                        return ((Number) idObj).longValue();
                    } else {
                        return Long.valueOf(idObj.toString());
                    }
                })
                .map(id -> userRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Utilisateur assigné à non trouvé")))
                .collect(Collectors.toSet());
        t.setAssignedTo(assignees);

        // Sauvegarde initiale pour générer l’ID
        t = tacheRepository.save(t);

        // Création du dossier pour stocker les fichiers
        Path taskDir = baseStorage.resolve(t.getId().toString());
        Files.createDirectories(taskDir);

        // Enregistrement du PDF principal sur disque
        Path pdfPath = taskDir.resolve("projectDetails.pdf");
        projectPdf.transferTo(pdfPath);
        t.setProjectDetailsPdf(pdfPath.toString());

        // Persist PDF principal en base comme attachment
        TacheAttachment pdfAtt = new TacheAttachment();
        pdfAtt.setFileName(projectPdf.getOriginalFilename());
        pdfAtt.setFilePath(pdfPath.toString());
        pdfAtt.setFileType(projectPdf.getContentType());
        pdfAtt.setFileSize(projectPdf.getSize());
        pdfAtt.setTache(t);
        attachmentRepository.save(pdfAtt);

        // Gestion des pièces jointes optionnelles
        if (attachments != null && attachments.length > 0) {
            for (MultipartFile file : attachments) {
                String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Path dest = taskDir.resolve(filename);
                file.transferTo(dest);

                // Persist pièce jointe en base
                TacheAttachment att = new TacheAttachment();
                att.setFileName(file.getOriginalFilename());
                att.setFilePath(dest.toString());
                att.setFileType(file.getContentType());
                att.setFileSize(file.getSize());
                att.setTache(t);
                attachmentRepository.save(att);
            }
        }

        // Mise à jour finale de la tâche
        return tacheRepository.save(t);
    }

    @Transactional(readOnly = true)
    public Resource loadAttachmentAsResource(Long attId) {
        TacheAttachment att = attachmentRepository.findById(attId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found"));
        try {
            Path file = Paths.get(att.getFilePath());
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found or not readable");
            }
        } catch (MalformedURLException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error reading file", ex);
        }
    }

    public List<Tache> getUnassignedTasks() {
        return tacheRepository.findByProjectIsNull();
    }

    /** Associe une tâche à un projet */
    @Transactional
    public void assignToProject(Long taskId, Long projectId) {
        Tache t = tacheRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Tâche introuvable"));
        Project p = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet introuvable"));
        t.setProject(p);
        tacheRepository.save(t);
    }
}
