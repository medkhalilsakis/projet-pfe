package com.projet.pp.service;

import com.projet.pp.model.Project;
import com.projet.pp.model.TestCase;
import com.projet.pp.model.TestCaseStep;
import com.projet.pp.repository.ProjectRepository;
import com.projet.pp.repository.TestCaseRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TestCaseService {
    @Autowired
    private TestCaseRepository repo;
    @Autowired
    private ProjectRepository projectRepo;

    public TestCase create(Long projectId, TestCase tc) {
        // 1) Vérifier que le numéro n’est pas déjà pris
        if (repo.existsByProjectIdAndCaseNumber(projectId, tc.getCaseNumber())) {
            throw new IllegalArgumentException(
                    "Le numéro de cas de test «" + tc.getCaseNumber() + "» existe déjà pour ce projet."
            );
        }

        // 2) Attacher le projet
        Project prj = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        tc.setProject(prj);

        // **NOUVEAU** : rattacher chaque étape au testCase parent
        tc.getSteps().forEach(step -> step.setTestCase(tc));


        // 3) Sauvegarder le TestCase + ses étapes
        return repo.save(tc);
    }

    public boolean existsByProjectAndCaseNumber(Long projectId, String caseNumber) {
        return repo.existsByProjectIdAndCaseNumber(projectId, caseNumber);
    }


    @Transactional(readOnly = true)
    public List<TestCase> findByProject(Long projectId) {
        return repo.findByProjectId(projectId);
    }


    @Transactional(readOnly = true)
    public TestCase findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("TestCase introuvable : " + id));
    }



    public long countByProject(Long projectId) {
        return repo.countByProject_Id(projectId);
    }


    @Transactional
    public TestCase update(Long projectId, Long tcId, TestCase tc) {
        // 1) Récupérer le cas existant
        TestCase existing = repo.findById(tcId)
                .orElseThrow(() -> new EntityNotFoundException("TestCase introuvable : " + tcId));

        // 2) Vérifier qu’il appartient bien au projet
        if (!existing.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Ce cas de test n’appartient pas au projet " + projectId);
        }

        // 3) Vérifier la nouvelle caseNumber si on l’a modifiée
        if (!existing.getCaseNumber().equals(tc.getCaseNumber())
                && repo.existsByProjectIdAndCaseNumber(projectId, tc.getCaseNumber())) {
            throw new IllegalArgumentException("Le numéro «" + tc.getCaseNumber() + "» existe déjà");
        }

        // 4) Mettre à jour les champs simples
        existing.setCaseNumber(tc.getCaseNumber());
        existing.setTitle(tc.getTitle());
        existing.setSubsystem(tc.getSubsystem());
        existing.setDescription(tc.getDescription());
        existing.setExecutionDate(tc.getExecutionDate());
        existing.setPreconditions(tc.getPreconditions());
        existing.setPostconditions(tc.getPostconditions());

        // 5) Synchroniser la liste des étapes
        //    - supprimer les étapes retirées
        existing.getSteps().removeIf(step ->
                tc.getSteps().stream().noneMatch(s2 -> s2.getId() != null && s2.getId().equals(step.getId()))
        );
        //    - ajouter / mettre à jour les étapes présentes dans tc.getSteps()
        for (TestCaseStep newStep : tc.getSteps()) {
            newStep.setTestCase(existing);
            if (newStep.getId() == null) {
                // nouvelle étape
                existing.getSteps().add(newStep);
            } else {
                // mise à jour d’une étape existante
                existing.getSteps().stream()
                        .filter(s -> s.getId().equals(newStep.getId()))
                        .findFirst()
                        .ifPresent(s -> {
                            s.setStepDesc(newStep.getStepDesc());
                            s.setAction(newStep.getAction());
                            s.setExpected(newStep.getExpected());
                            s.setComment(newStep.getComment());
                            s.setSuccess(newStep.isSuccess());
                        });
            }
        }

        // 6) Sauvegarder
        return repo.save(existing);
    }


    @Transactional
    public void delete(Long projectId, Long tcId) {
        // 1) Charger le TestCase
        TestCase existing = repo.findById(tcId)
                .orElseThrow(() -> new EntityNotFoundException("TestCase introuvable : " + tcId));

        // 2) Vérifier qu’il appartient au projet
        if (!existing.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Ce cas de test n’appartient pas au projet " + projectId);
        }

        // 3) Supprimer (cascade et orphanRemoval gèrent les étapes)
        repo.delete(existing);
    }

}