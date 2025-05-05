package com.projet.pp.repository;

import com.projet.pp.model.ProjectTesterAssignment;
import com.projet.pp.model.TestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface ProjectTesterAssignmentRepository extends JpaRepository<ProjectTesterAssignment, Long> {
    List<ProjectTesterAssignment> findByProjectId(Long projectId);
    long countByTesteurIdAndStatutTest(Long testeurId, TestStatus statutTest);
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
}
