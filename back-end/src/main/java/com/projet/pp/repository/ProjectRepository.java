package com.projet.pp.repository;

import com.projet.pp.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByUserId(Long userId);
    List<Project> findAll();
    List<Project> findByStatus(int status);
    //List<Project> findByTesterId(Long testerId);


    List<Project> findByStatusIn(List<Integer> statuses);

    @Query("SELECT p FROM Project p LEFT JOIN FETCH p.assignments WHERE p.status = :status")
    List<Project> findProjectsByStatusWithAssignments(@Param("status") Integer status);

}
