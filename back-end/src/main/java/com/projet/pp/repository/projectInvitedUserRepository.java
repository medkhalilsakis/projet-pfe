package com.projet.pp.repository;

import com.projet.pp.model.ProjectInvitedUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import com.projet.pp.model.Project;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface projectInvitedUserRepository extends JpaRepository<ProjectInvitedUser, Long> {
    List<ProjectInvitedUser> findByProjectId(Long projectId);
    List<ProjectInvitedUser> findByProject(Project project);

    @Modifying
    @Transactional
    @Query("DELETE FROM ProjectInvitedUser iu WHERE iu.user.id = :userId")
    void deleteByInvitedUserId(@Param("userId") Long userId);


    @Modifying
    @Transactional
    @Query("""
      DELETE FROM ProjectInvitedUser iu
      WHERE iu.project.id = :projectId
        AND iu.user.id    = :userId
      """)
    int deleteByProjectIdAndUserId(
            @Param("projectId") Long projectId,
            @Param("userId")    Long userId
    );

    @Modifying
    @Transactional
    @Query("DELETE FROM ProjectInvitedUser iu WHERE iu.project.id = :projectId")
    void deleteByProjectId(@Param("projectId") Long projectId);

}