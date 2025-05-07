package com.projet.pp.repository;

import com.projet.pp.model.ProjectTesterAssignment;
import com.projet.pp.model.TestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ProjectTesterAssignmentRepository extends JpaRepository<ProjectTesterAssignment, Long> {
    List<ProjectTesterAssignment> findByProjectId(Long projectId);
    ProjectTesterAssignment findAssignmentByProjectId(Long projectId);

    long countByTesteurIdAndStatutTest(Long testeurId, TestStatus statutTest);
    void deleteByProjectId(Long projectId);
    Optional<ProjectTesterAssignment> findByProjectIdAndTesteurId(Long projectId, Long testeurId);
    List<ProjectTesterAssignment> findByTesteur_Id(Long testeurId);
    long countByTesteur_Id(Long testeurId);
    /**
     * Active tasks = assignments NOT in status 'suspendu' or 'cloturé'.
     */

    @Query("""
      SELECT COUNT(a)
      FROM ProjectTesterAssignment a
      WHERE a.testeur.id = :testeurId
        AND a.statutTest NOT IN ('en_pause','non_commence')
    """)
    long countActiveTasks(@Param("testeurId") Long testeurId);

    /**
     * Active projects = distinct projects in assignments
     * NOT in status 'suspendu' or 'cloturé'.
     */

    @Query("""
      SELECT COUNT(DISTINCT a.project.id)
      FROM ProjectTesterAssignment a
      WHERE a.testeur.id = :testeurId
        AND a.statutTest NOT IN ('en_pause','non_commence')
    """)
    long countActiveProjects(@Param("testeurId") Long testeurId);

    @Query("""
    SELECT COUNT(DISTINCT a.project.id)
    FROM ProjectTesterAssignment a
    WHERE a.testeur.id = :testeurId
      AND a.project.status = :projectStatus
      AND a.project.updatedAt BETWEEN :from AND :to
""")
    long countProjectsByTesteur_IdAndProject_StatusAndProject_UpdatedAtBetween(Long testeurId, int projectStatus, LocalDateTime from, LocalDateTime to);

}
