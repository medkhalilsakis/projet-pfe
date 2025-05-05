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
        Project prj = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        tc.setProject(prj);       // ← on fixe la relation avant save()
        return repo.save(tc);
    }

    public List<TestCase> findByProject(Long projectId) {
        return repo.findByProjectId(projectId);
    }
    // update, delete...
}