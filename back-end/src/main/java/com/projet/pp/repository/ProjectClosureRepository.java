package com.projet.pp.repository;

import com.projet.pp.model.ProjectClosure;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProjectClosureRepository extends JpaRepository<ProjectClosure, Long> {
    Optional<ProjectClosure> findFirstByProjectIdOrderByClosureAtDesc(Long projectId);
}

