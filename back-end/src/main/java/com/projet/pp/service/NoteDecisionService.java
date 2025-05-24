package com.projet.pp.service;

import com.projet.pp.model.NoteDecision;
import com.projet.pp.repository.NoteDecisionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NoteDecisionService {

    private final NoteDecisionRepository repo;

    @Autowired
    public NoteDecisionService(NoteDecisionRepository repo) {
        this.repo = repo;
    }

    public List<NoteDecision> findAll() {
        return repo.findAll();
    }

    public Optional<NoteDecision> findById(Integer id) {
        return repo.findById(id);
    }

    public NoteDecision create(NoteDecision note) {
        return repo.save(note);
    }

    public NoteDecision update(Integer id, NoteDecision updated) {
        return repo.findById(id)
                .map(existing -> {
                    existing.setTypeNote(updated.getTypeNote());
                    existing.setTitre(updated.getTitre());
                    existing.setContenu(updated.getContenu());
                    existing.setDateModification(LocalDateTime.now());
                    existing.setStatut(updated.getStatut());
                    existing.setSuperviseur(updated.getSuperviseur());
                    existing.setRemarque(updated.getRemarque());
                    existing.setFichierJoint(updated.getFichierJoint());
                    return repo.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("NoteDecision non trouvée : " + id));
    }

    public void delete(Integer id) {
        repo.deleteById(id);
    }
}