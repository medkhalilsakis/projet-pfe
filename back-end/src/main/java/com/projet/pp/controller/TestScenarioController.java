// src/main/java/com/projet/pp/controller/TestScenarioController.java
package com.projet.pp.controller;

import com.projet.pp.dto.TestScenarioDto;
import com.projet.pp.model.TestScenario;
import com.projet.pp.model.TestScenarioStep;
import com.projet.pp.model.Project;
import com.projet.pp.model.User;
import com.projet.pp.service.TestScenarioService;
import com.projet.pp.repository.ProjectRepository;
import com.projet.pp.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.*;

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

    @PostMapping
    public ResponseEntity<TestScenarioDto> create(
            @RequestBody TestScenarioDto dto
    ) {
        // 1) Charger Project
        Project projet = projectRepo.findById(dto.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Project inconnu"));

        // 2) Charger superviseur
        User superviseur = userRepo.findById(dto.getSuperviseurId())
                .orElseThrow(() -> new IllegalArgumentException("Superviseur inconnu"));

        // 3) Construire l’entité
        TestScenario scenario = TestScenario.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .project(projet)
                .superviseur(superviseur)
                .build();

        // 4) Ajout des étapes (avec liaison bi-directionnelle)
        if (dto.getSteps() != null) {
            dto.getSteps().forEach(stepDto -> {
                TestScenarioStep step = TestScenarioStep.builder()
                        .description(stepDto.getDescription())
                        .expected(stepDto.getExpected())
                        .build();
                scenario.addStep(step);
            });
        }

        // 5) Sauvegarde
        TestScenario saved = service.save(scenario);

        // 6) Retourne un DTO
        TestScenarioDto result = TestScenarioDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .description(saved.getDescription())
                .projectId(saved.getProject().getId())
                .superviseurId(saved.getSuperviseur().getId())
                .steps(saved.getSteps().stream()
                        .map(s -> new TestScenarioDto.TestScenarioStepDto(
                                s.getId(),
                                s.getDescription(),
                                s.getExpected()
                        ))
                        .collect(Collectors.toList())
                )
                .build();

        return ResponseEntity.ok(result);
    }

    // même approche pour PUT
    @PutMapping("/{id}")
    public ResponseEntity<TestScenarioDto> update(
            @PathVariable Long id,
            @RequestBody TestScenarioDto dto
    ) {
        return service.findById(id).map(existing -> {
            // re-charger project & superviseur
            Project projet = projectRepo.findById(dto.getProjectId())
                    .orElseThrow();
            User superviseur = userRepo.findById(dto.getSuperviseurId())
                    .orElseThrow();

            // mettre à jour
            existing.setName(dto.getName());
            existing.setDescription(dto.getDescription());
            existing.setProject(projet);
            existing.setSuperviseur(superviseur);
            existing.getSteps().clear();
            if (dto.getSteps() != null) {
                dto.getSteps().forEach(stepDto -> {
                    TestScenarioStep step = TestScenarioStep.builder()
                            .description(stepDto.getDescription())
                            .expected(stepDto.getExpected())
                            .build();
                    existing.addStep(step);
                });
            }

            TestScenario saved = service.save(existing);
            // mapping en DTO identique à create…
            TestScenarioDto result = TestScenarioDto.builder()
                    .id(saved.getId())
                    // etc.
                    .build();
            return ResponseEntity.ok(result);
        }).orElse(ResponseEntity.notFound().build());
    }


    @GetMapping("/exists/{projectId}")
    public ResponseEntity<Boolean> existsForProject(@PathVariable Long projectId) {
        boolean exists = service.existsByProjectId(projectId);
        return ResponseEntity.ok(exists);
    }

}
