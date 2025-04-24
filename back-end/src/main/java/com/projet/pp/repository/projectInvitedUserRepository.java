package com.projet.pp.repository;

import com.projet.pp.model.ProjectInvitedUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface projectInvitedUserRepository extends JpaRepository<ProjectInvitedUser, Long> {
    List<ProjectInvitedUser> findByProjectId(Long projectId);
}