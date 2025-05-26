package com.projet.pp.service;

import com.projet.pp.model.TestScenario;
import com.projet.pp.repository.TestScenarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TestScenarioService {
    private final TestScenarioRepository repo;

    public TestScenarioService(TestScenarioRepository repo) {
        this.repo = repo;
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
}