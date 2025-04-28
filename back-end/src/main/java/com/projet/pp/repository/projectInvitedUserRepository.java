package com.projet.pp.repository;

import com.projet.pp.model.ProjectInvitedUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import com.projet.pp.model.Project;

public interface projectInvitedUserRepository extends JpaRepository<ProjectInvitedUser, Long> {
    List<ProjectInvitedUser> findByProjectId(Long projectId);
    List<ProjectInvitedUser> findByProject(Project project);

}