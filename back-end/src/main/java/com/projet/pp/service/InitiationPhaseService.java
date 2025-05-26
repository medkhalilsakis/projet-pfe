package com.projet.pp.service;

import com.projet.pp.model.InitiationPhase;
import com.projet.pp.repository.InitiationPhaseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InitiationPhaseService {

    private final InitiationPhaseRepository repo;

    public InitiationPhaseService(InitiationPhaseRepository repo) {
        this.repo = repo;
    }

    public List<InitiationPhase> findAll() {
        return repo.findAll();
    }

    public Optional<InitiationPhase> findById(Long id) {
        return repo.findById(id);
    }

    public InitiationPhase save(InitiationPhase phase) {
        return repo.save(phase);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    public boolean existsForTache(Long tacheId) {
        return repo.existsByTache_Id(tacheId);
    }
}
