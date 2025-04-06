package com.projet.pp.repository;

import com.projet.pp.model.ProjectTesterAssignment;
import com.projet.pp.model.TestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectTesterAssignmentRepository extends JpaRepository<ProjectTesterAssignment, Long> {
    List<ProjectTesterAssignment> findByProjectId(Long projectId);
    long countByTesteurIdAndStatutTest(Long testeurId, TestStatus statutTest);
}
