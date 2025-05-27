package com.projet.pp.repository;

import com.projet.pp.model.ProjectInvitedUser;
import com.projet.pp.model.ProjectInvitedUserId;
import com.projet.pp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import com.projet.pp.model.Project;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface projectInvitedUserRepository extends JpaRepository<ProjectInvitedUser, Long> {
    List<ProjectInvitedUser> findByProjectId(Long projectId);
    List<ProjectInvitedUser> findByProject(Project project);
    boolean existsByProjectAndUser(Project project, User user);

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

    @Query("SELECT iu.project.id FROM ProjectInvitedUser iu WHERE iu.user.id = :userId")
    List<Long> findProjectsIdByUserId(@Param("userId") Long userId);

    @Query("""
      SELECT iu
      FROM ProjectInvitedUser iu
      WHERE iu.project.id = :projectId
        AND iu.user.id    = :userId
    """)
    Optional<ProjectInvitedUser> findByProjectIdAndUserId(
            @Param("projectId") Long projectId,
            @Param("userId")    Long userId
    );
    @Query("""
    SELECT iu.project.id
    FROM ProjectInvitedUser iu
    WHERE iu.user.id = :userId
      AND iu.status = 'accepted'
  """)
    List<Long> findAcceptedProjectIdsByUserId(@Param("userId") Long userId);

    List<ProjectInvitedUser> findByUser_Id(Long userId);
}
