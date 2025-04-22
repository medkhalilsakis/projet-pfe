package com.projet.pp.repository;

import com.projet.pp.model.User;
import com.projet.pp.model.Tache;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TacheRepository extends JpaRepository<Tache, Long> {
    List<Tache> findByAssignedTo(User user);
    List<Tache> findByStatus(String status); // Optional: for 'to develop' or 'to test'
}