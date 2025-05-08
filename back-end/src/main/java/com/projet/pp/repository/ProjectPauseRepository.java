package com.projet.pp.repository;

import com.projet.pp.model.ProjectPause;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProjectPauseRepository extends JpaRepository<ProjectPause, Long> {
    Optional<ProjectPause> findFirstByProjectIdOrderByPausedAtDesc(Long projectId);

}
