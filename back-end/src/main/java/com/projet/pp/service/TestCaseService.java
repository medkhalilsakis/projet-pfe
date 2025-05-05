package com.projet.pp.service;

import com.projet.pp.model.Project;
import com.projet.pp.model.TestCase;
import com.projet.pp.repository.ProjectRepository;
import com.projet.pp.repository.TestCaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
                    "Le numéro de cas de test « "
                            + tc.getCaseNumber()
                            + " » existe déjà pour ce projet."
            );
        }

        // 2) Attacher le projet et sauvegarder
        Project prj = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        tc.setProject(prj);

        return repo.save(tc);
    }

    public boolean existsByProjectAndCaseNumber(Long projectId, String caseNumber) {
        return repo.existsByProjectIdAndCaseNumber(projectId, caseNumber);
    }


    public List<TestCase> findByProject(Long projectId) {
        return repo.findByProjectId(projectId);
    }
    // update, delete...
}