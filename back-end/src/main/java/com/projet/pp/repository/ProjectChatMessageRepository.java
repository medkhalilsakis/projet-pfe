package com.projet.pp.repository;

import com.projet.pp.model.ProjectChatMessage;
import com.projet.pp.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectChatMessageRepository extends JpaRepository<ProjectChatMessage, Long> {
    List<ProjectChatMessage> findByProjectIdOrderByCreatedAtAsc(Long projectId);
}