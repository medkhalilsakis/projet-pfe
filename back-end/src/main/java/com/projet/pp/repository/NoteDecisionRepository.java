package com.projet.pp.repository;


import com.projet.pp.model.NoteDecision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoteDecisionRepository extends JpaRepository<NoteDecision, Integer> {
    // Vous pouvez ajouter des méthodes de requête custom ici
}