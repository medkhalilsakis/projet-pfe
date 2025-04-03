package com.projet.pp.repository;

import com.projet.pp.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByUserId(Long userId);
    List<Project> findAll();
    //List<Project> findByTesterId(Long testerId);
}
