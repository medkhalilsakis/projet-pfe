package com.projet.pp.repository;

import com.projet.pp.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByUserId(Long userId);
    List<Project> findAll();
    List<Project> findByStatus(int status);
    long countByStatusAndUpdatedAtBetween(int status, LocalDateTime from, LocalDateTime to);
    long countByUser_Id(Long userId);
    long countByUser_IdAndStatus(Long userId, Integer status);
    long countByUser_IdAndStatusAndUpdatedAtBetween(
            Long userId,
            Integer status,
            LocalDateTime startDate,
            LocalDateTime endDate
    );
//do the query of the last two functions

    //List<Project> findByTesterId(Long testerId);
}
