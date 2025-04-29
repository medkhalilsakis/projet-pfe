package com.projet.pp.repository;

import com.projet.pp.model.User;
import com.projet.pp.model.Tache;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TacheRepository extends JpaRepository<Tache, Long> {
    List<Tache> findByNameContainingIgnoreCase(String q);
    List<Tache> findByStatus(Tache.Status status);
    List<Tache> findByAssignedToId(Long userId);
    List<Tache> findByNameContainingIgnoreCaseAndStatusAndAssignedToId(String q, Tache.Status status, Long userId);
    List<Tache> findByProjectIsNull();
}
