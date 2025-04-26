package com.projet.pp.service;

import com.projet.pp.model.Tache;
import com.projet.pp.model.User;
import com.projet.pp.repository.TacheRepository;
import com.projet.pp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.util.*;


@Service
public class TacheService {

    @Autowired
    private TacheRepository tacheRepository;

    @Autowired
    private UserRepository userRepository;


    private final Path baseStorage = Paths.get("uploads/taches").toAbsolutePath().normalize();

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
            return tacheRepository.findByNameContainingIgnoreCaseAndStatusAndAssignedToId(q, status, assignedTo);
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

    /**
     * Crée une nouvelle tâche et stocke les fichiers :
     * - projectPdf (obligatoire)
     * - attachments[] (facultatif)
     *
     * @param data        map des champs (name, description, outils, creationDate, deadline, status, assignedBy, assignedTo)
     * @param projectPdf  PDF principal
     * @param attachments autres pièces jointes optionnelles
     */
    @Transactional
    public Tache create(
            Map<String, String> data,
            MultipartFile projectPdf,
            MultipartFile[] attachments
    ) throws IOException {
        // --- 1) Construction de l'entité Tache à partir des données ---
        Tache t = new Tache();
        t.setName(data.get("name"));
        t.setDescription(data.get("description"));
        t.setOutils(data.get("outils"));
        t.setCreationDate(LocalDate.parse(data.get("creationDate")));
        t.setDeadline(LocalDate.parse(data.get("deadline")));
        t.setStatus(Tache.Status.valueOf(data.get("status")));

        Long byId = Long.valueOf(data.get("assignedBy"));
        Long toId = Long.valueOf(data.get("assignedTo"));
        User assignedBy = userRepository.findById(byId)
                .orElseThrow(() -> new RuntimeException("Utilisateur assigné par non trouvé"));
        User assignedTo = userRepository.findById(toId)
                .orElseThrow(() -> new RuntimeException("Utilisateur assigné à non trouvé"));

        t.setAssignedBy(assignedBy);
        t.setAssignedTo(assignedTo);

        // Sauvegarde initiale pour obtenir l'ID
        t = tacheRepository.save(t);

        // --- 2) Préparation du dossier de stockage uploads/taches/{id} ---
        Path taskDir = baseStorage.resolve(t.getId().toString());
        Files.createDirectories(taskDir);

        // --- 3) Enregistrement du PDF principal ---
        Path pdfPath = taskDir.resolve("projectDetails.pdf");
        projectPdf.transferTo(pdfPath);
        t.setProjectDetailsPdf(pdfPath.toString());

        // --- 4) Gestion des pièces jointes optionnelles ---
        if (attachments != null) {
            for (MultipartFile file : attachments) {
                String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Path dest = taskDir.resolve(filename);
                file.transferTo(dest);
                // si vous avez une entité TaskAttachment, vous pouvez la persist­er :
                // attachmentRepository.save(new TaskAttachment(null, t, dest.toString()));
            }
        }

        // Mise à jour finale de la tâche
        return tacheRepository.save(t);
    }
}
