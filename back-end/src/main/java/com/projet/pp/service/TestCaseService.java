package com.projet.pp.service;

import com.projet.pp.model.Project;
import com.projet.pp.model.TestCase;
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

}