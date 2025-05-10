package com.projet.pp.service;

import com.projet.pp.model.Project;
import com.projet.pp.model.Tache;
import com.projet.pp.model.TacheAttachment;
import com.projet.pp.model.User;
import com.projet.pp.repository.ProjectRepository;
import com.projet.pp.repository.TacheAttachmentRepository;
import com.projet.pp.repository.TacheRepository;
import com.projet.pp.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

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
    public Optional<Tache> getTacheByProjectId(Long id) {
        return tacheRepository.findByProject_Id(id);
    }

    // src/main/java/com/projet/pp/service/TacheService.java
    @Transactional
    public void deleteTache(Long id) {
        // 1) charger la tâche avec ses pièces jointes et assignations
        Tache t = tacheRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tâche introuvable"));

        // 2) nettoyage des fichiers sur disque
        Path taskDir = baseStorage.resolve(t.getId().toString());
        try {
            if (Files.exists(taskDir)) {
                Files.walk(taskDir)
                        .sorted(Comparator.reverseOrder())
                        .map(Path::toFile)
                        .forEach(File::delete);
            }
        } catch (IOException e) {
            // logguez si nécessaire, mais on continue
        }

        // 3) suppression des attachments en base (cascade via orphanRemoval)
        t.getAttachments().clear();

        // 4) suppression des assignations dans la table de jointure
        t.getAssignedTo().clear();

        // 5) on persiste les deux clear() pour que JPA exécute DELETE sur join table et attachments
        tacheRepository.save(t);

        // 6) enfin on supprime la tâche elle-même
        tacheRepository.delete(t);
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


    // src/main/java/com/projet/pp/service/TacheService.java
    @Transactional
    public Tache update(
            Long id,
            Map<String,Object> data,
            MultipartFile projectPdf,
            MultipartFile[] attachments,
            List<Long> removeAttIds
    ) throws IOException {
        // 1) charger l’entité existante
        Tache t = tacheRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tâche introuvable"));

        // 2) mettre à jour les champs simples
        t.setName((String) data.get("name"));
        t.setDescription((String) data.get("description"));
        t.setOutils((String) data.get("outils"));
        t.setDeadline(LocalDate.parse((String) data.get("deadline")));
        t.setStatus(Tache.Status.valueOf(((String)data.get("status")).toLowerCase()));

        // 3) assignedBy
        Long assignedById = Long.valueOf(data.get("assignedBy").toString());
        User assignedBy = userRepository.findById(assignedById)
                .orElseThrow(() -> new RuntimeException("Utilisateur assigné par non trouvé"));
        t.setAssignedBy(assignedBy);

        // 4) assignedTo (ManyToMany)
        @SuppressWarnings("unchecked")
        List<Object> toIds = (List<Object>) data.get("assignedTo");
        Set<User> assignees = toIds.stream()
                .map(obj -> obj instanceof Number
                        ? ((Number)obj).longValue()
                        : Long.valueOf(obj.toString()))
                .map(uid -> userRepository.findById(uid)
                        .orElseThrow(() -> new RuntimeException("Utilisateur assigné non trouvé")))
                .collect(Collectors.toSet());
        t.setAssignedTo(assignees);

        // 5) supprimer les attachments demandés
        if (removeAttIds != null) {
            for (Long attId : removeAttIds) {
                attachmentRepository.findById(attId).ifPresent(att -> {
                    try {
                        Files.deleteIfExists(Paths.get(att.getFilePath()));
                    } catch (IOException e) { /* loger */ }
                    attachmentRepository.delete(att);
                });
            }
        }

        // 6) gérer le PDF principal si nouveau upload
        Path taskDir = baseStorage.resolve(t.getId().toString());
        Files.createDirectories(taskDir);
        if (projectPdf != null) {
            // écraser l’ancien
            Path pdfPath = taskDir.resolve("projectDetails.pdf");
            projectPdf.transferTo(pdfPath);
            t.setProjectDetailsPdf(pdfPath.toString());

            // mettre à jour l’attachement PDF en base
            TacheAttachment pdfAtt = attachmentRepository.findByTache_IdAndFileType(t.getId(), "application/pdf")
                    .orElseGet(() -> {
                        TacheAttachment a = new TacheAttachment();
                        a.setTache(t);
                        return a;
                    });
            pdfAtt.setFileName(projectPdf.getOriginalFilename());
            pdfAtt.setFilePath(pdfPath.toString());
            pdfAtt.setFileType(projectPdf.getContentType());
            pdfAtt.setFileSize(projectPdf.getSize());
            attachmentRepository.save(pdfAtt);
        }

        // 7) gérer les nouveaux autres attachments
        if (attachments != null) {
            for (MultipartFile file : attachments) {
                String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Path dest = taskDir.resolve(filename);
                file.transferTo(dest);
                TacheAttachment att = new TacheAttachment();
                att.setTache(t);
                att.setFileName(file.getOriginalFilename());
                att.setFilePath(dest.toString());
                att.setFileType(file.getContentType());
                att.setFileSize(file.getSize());
                attachmentRepository.save(att);
            }
        }

        // 8) sauver et retourner
        return tacheRepository.save(t);
    }


    @Transactional(readOnly = true)
    public Resource getAllAttachmentsAsZip(Long taskId) throws IOException {
        // Récupère toutes les pièces jointes de la tâche
        List<TacheAttachment> atts = attachmentRepository.findByTache_Id(taskId);

        // Crée le ZIP en mémoire
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            for (TacheAttachment att : atts) {
                Path path = Paths.get(att.getFilePath());
                ZipEntry entry = new ZipEntry(att.getFileName());
                zos.putNextEntry(entry);
                Files.copy(path, zos);
                zos.closeEntry();
            }
        }

        return new ByteArrayResource(baos.toByteArray());
    }


    @Transactional
    public void syncStatus(Long tacheId) {
        Tache t = tacheRepository.findById(tacheId)
                .orElseThrow(() -> new RuntimeException("Tâche introuvable : " + tacheId));

        Project p = t.getProject();
        Tache.Status newStatus;
        if (p == null) {
            // pas de projet lié → niveau développement
            newStatus = Tache.Status.a_developper;
        } else {
            Integer projSt = p.getStatus();
            // votre mapping projet→tâche
            if (projSt == null) {
                newStatus = Tache.Status.a_developper;
            } else if (projSt == 2 || projSt == 3) {
                newStatus = Tache.Status.en_cours;
            } else if (projSt == 4) {
                newStatus = Tache.Status.terminé;
            } else if (projSt == 55) {
                newStatus = Tache.Status.suspendu;
            } else if (projSt == 99) {
                newStatus = Tache.Status.cloturé;
            } else {
                newStatus = Tache.Status.a_developper;
            }
        }

        if (t.getStatus() != newStatus) {
            t.setStatus(newStatus);
            tacheRepository.save(t);
        }
    }

    public long getByStatus(Tache.Status status) {
        return tacheRepository.countByStatus(status);
    }public long getByStatusAndAssignedTo(Long id, Tache.Status status) {
        User assignedTo=userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Developer not found with id: " + id));

        return tacheRepository.countByStatusAndAssignedTo(status,assignedTo);
    }


}
