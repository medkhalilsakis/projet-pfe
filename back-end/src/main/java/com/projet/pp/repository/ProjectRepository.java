package com.projet.pp.repository;

import com.projet.pp.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByUserId(Long userId);
    List<Project> findAll();
    List<Project> findByStatus(int status);
    //List<Project> findByTesterId(Long testerId);


    List<Project> findByStatusIn(List<Integer> statuses);

    @Query("SELECT p FROM Project p LEFT JOIN FETCH p.assignments WHERE p.status = :status")
    List<Project> findProjectsByStatusWithAssignments(@Param("status") Integer status);


    @Modifying
    @Transactional
    @Query("""
    UPDATE Project p
    SET p.user = (SELECT u FROM User u WHERE u.id = 0)
    WHERE p.user.id = :userId
    """)
    void reassignDeletedOwner(@Param("userId") Long userId);

    long countByStatusAndUpdatedAtBetween(int status, LocalDateTime from, LocalDateTime to);
    long countByUser_Id(Long userId);
    long countByUser_IdAndStatus(Long userId, Integer status);
    long countByUser_IdAndStatusAndUpdatedAtBetween(
            Long userId,
            Integer status,
            LocalDateTime startDate,
            LocalDateTime endDate
    );
}
