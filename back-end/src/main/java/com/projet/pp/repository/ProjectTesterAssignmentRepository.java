package com.projet.pp.repository;

import com.projet.pp.model.ProjectTesterAssignment;
import com.projet.pp.model.TestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectTesterAssignmentRepository extends JpaRepository<ProjectTesterAssignment, Long> {
    List<ProjectTesterAssignment> findByProjectId(Long projectId);
    long countByTesteurIdAndStatutTest(Long testeurId, TestStatus statutTest);
    void deleteByProjectId(Long projectId);
    Optional<ProjectTesterAssignment> findByProjectIdAndTesteurId(Long projectId, Long testeurId);

}
