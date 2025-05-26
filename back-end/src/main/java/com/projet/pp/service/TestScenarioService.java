package com.projet.pp.service;

import com.projet.pp.model.TestScenario;
import com.projet.pp.repository.TestScenarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TestScenarioService {
    private final TestScenarioRepository repo;

    @Autowired
    private  TacheService tacheService;


    @Autowired
    public TestScenarioService(TestScenarioRepository repo, TacheService tacheService) {
        this.repo = repo;
        this.tacheService = tacheService;
    }


    public List<TestScenario> findAll() {
        return repo.findAll();
    }

    public Optional<TestScenario> findById(Long id) {
        return repo.findById(id);
    }

    @Transactional(readOnly = true)
    public boolean existsByProjectId(Long projectId) {
        return repo.existsByProject_Id(projectId);
    }

    @Transactional
    public TestScenario save(TestScenario scenario) {
        return repo.save(scenario);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }


    public TestScenario getTestScenarioByProjectId(Long projectId) {
        // 1. Récupérer l'ID de la tâche à partir du projectId
        Long tacheId = tacheService.getTacheIdByProjectId(projectId);

        // 2. Récupérer le scénario de test en fonction de tacheId
        return repo.findByTacheId(tacheId)
                .orElseThrow(() -> new IllegalArgumentException("Aucun scénario de test trouvé pour tache_id : " + tacheId));
    }
}