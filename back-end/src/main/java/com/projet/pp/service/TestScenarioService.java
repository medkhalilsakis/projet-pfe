package com.projet.pp.service;

import com.projet.pp.model.TestScenario;
import com.projet.pp.repository.TestScenarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Optional;

@Service
public class TestScenarioService {
    private final TestScenarioRepository repo;
    private final Path storageDir = Paths.get("uploads/test-scenarios").toAbsolutePath().normalize();

    @Autowired
    public TestScenarioService(TestScenarioRepository repo) throws IOException {
        this.repo = repo;
        Files.createDirectories(storageDir);
    }

    public List<TestScenario> findAll() {
        return repo.findAll();
    }

    public Optional<TestScenario> findById(Long id) {
        return repo.findById(id);
    }

    public boolean existsByProjectId(Long projectId) {
        return repo.existsByProject_Id(projectId);
    }

    /** Crée ou met à jour (selon que dto.id soit null ou non) un scénario,
     *  gère l’upload optionnel d’un fichier joint. */
    @Transactional
    public TestScenario saveWithAttachment(
            TestScenario scenario,
            MultipartFile file
    ) throws IOException {
        // Si on a un fichier à uploader
        if (file != null && !file.isEmpty()) {
            // Génère un nom unique
            String ext = Optional.ofNullable(file.getOriginalFilename())
                    .filter(n -> n.contains("."))
                    .map(n -> n.substring(n.lastIndexOf('.')))
                    .orElse("");
            String filename = System.currentTimeMillis() + "_" + java.util.UUID.randomUUID() + ext;
            Path target = storageDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            // Remplit les champs d’attachement
            scenario.setAttachmentName(file.getOriginalFilename());
            scenario.setAttachmentPath(target.toString());
            scenario.setAttachmentType(file.getContentType());
            scenario.setAttachmentSize(file.getSize());
        }
        return repo.save(scenario);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    /** Récupère le scénario lié à un projet (uniquement DTO ou entité brute) */
    public TestScenario getByProjectId(Long projectId) {
        return repo.findByProject_Id(projectId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Aucun scénario de test trouvé pour project_id=" + projectId));
    }
}
