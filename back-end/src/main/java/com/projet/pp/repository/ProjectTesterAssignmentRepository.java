package com.projet.pp.repository;

import com.projet.pp.model.ProjectTesterAssignment;
import com.projet.pp.model.TestApproval;

import com.projet.pp.model.TestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ProjectTesterAssignmentRepository extends JpaRepository<ProjectTesterAssignment, Long> {
    List<ProjectTesterAssignment> findByProjectId(Long projectId);
    ProjectTesterAssignment findOneByProjectId(Long projectId);


    void deleteByProjectId(Long projectId);
    Optional<ProjectTesterAssignment> findByProjectIdAndTesteurId(Long projectId, Long testeurId);
    List<ProjectTesterAssignment> findByTesteurId(Long testeurId);

    @Modifying
    @Transactional
    @Query("""
    UPDATE ProjectTesterAssignment a
    SET a.superviseur = (SELECT u FROM User u WHERE u.id = 0)
    WHERE a.superviseur.id = :userId
    """)
    void reassignDeletedSuperviseur(@Param("userId") Long userId);

    @Modifying @Transactional
    @Query("DELETE FROM ProjectTesterAssignment a WHERE a.testeur.id = :userId")
    void deleteByDeletedTesteur(@Param("userId") Long userId);

    /** Total tests run by this tester */

    /** Total *failed* tests (where testOutcome = FAILED) */
    long countByTesteur_IdAndDecision(Long testeurId, TestApproval testOutcome);
    long count();

    /** Count runs by outcome (SUCCESS or FAILURE) */
    long countByDecision(TestApproval testOutcome);
    long countByProject_User_Id(Long userId);

    /**
     * Number of those runs on projects owned by the given user that had the given outcome.
     */
    long countByProject_User_IdAndDecision(
            Long userId,
            TestApproval testOutcome
    );

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
    long countByTesteur_Id(Long testeurId);


    List<ProjectTesterAssignment> findByTesteur_IdAndStatutTest(Long testeurId, TestStatus statutTest);
    Optional<ProjectTesterAssignment> findByTesteur_IdAndProject_Id(Long testeurId, Long projectId);

}
