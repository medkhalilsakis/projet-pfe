package com.projet.pp.controller;

import com.projet.pp.dto.TestScenarioDto;
import com.projet.pp.model.TestScenario;
import com.projet.pp.model.TestScenarioStep;
import com.projet.pp.model.Project;
import com.projet.pp.model.User;
import com.projet.pp.repository.ProjectRepository;
import com.projet.pp.repository.UserRepository;
import com.projet.pp.service.TestScenarioService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/test-scenarios")
@CrossOrigin(origins = "http://localhost:4200")
public class TestScenarioController {

    private final TestScenarioService service;
    private final ProjectRepository projectRepo;
    private final UserRepository userRepo;

    @Autowired
    public TestScenarioController(
            TestScenarioService service,
            ProjectRepository projectRepo,
            UserRepository userRepo
    ) {
        this.service     = service;
        this.projectRepo = projectRepo;
        this.userRepo    = userRepo;
    }

    /** Création ou mise à jour via multipart/form-data */
    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<TestScenarioDto> createOrUpdate(
            @RequestPart("data") TestScenarioDto dto,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) throws IOException {
        // 1) Charger les relations
        Project projet = projectRepo.findById(dto.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Projet inconnu"));
        User superviseur = userRepo.findById(dto.getSuperviseurId())
                .orElseThrow(() -> new IllegalArgumentException("Superviseur inconnu"));

        // 2) Construire l’entité
        TestScenario scenario = (dto.getId() == null)
                ? TestScenario.builder().build()
                : service.findById(dto.getId())
                .orElseThrow(() -> new IllegalArgumentException("Scénario introuvable"));

        scenario.setName(dto.getName());
        scenario.setDescription(dto.getDescription());
        scenario.setProject(projet);
        scenario.setSuperviseur(superviseur);

        // 3) Mettre à jour les étapes
        scenario.getSteps().clear();
        if (dto.getSteps() != null) {
            dto.getSteps().forEach(stepDto -> {
                TestScenarioStep step = TestScenarioStep.builder()
                        .description(stepDto.getDescription())
                        .expected(stepDto.getExpected())
                        .build();
                scenario.addStep(step);
            });
        }

        // 4) Sauvegarder avec upload éventuel
        TestScenario saved = service.saveWithAttachment(scenario, file);

        // 5) Retourner un DTO
        TestScenarioDto result = TestScenarioDto.fromEntity(saved);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<TestScenario> getScenarioByProject(
            @PathVariable Long projectId) {
        try {
            TestScenario scenario = service.getByProjectId(projectId);
            return ResponseEntity.ok(scenario);
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/project/{projectId}/exists")
    public ResponseEntity<Boolean> existsByProject(
            @PathVariable Long projectId) {
        boolean exists = service.existsForProject(projectId);
        return ResponseEntity.ok(exists);
    }

}
