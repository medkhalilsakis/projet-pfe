package com.projet.pp.repository;

import com.projet.pp.model.Project;
import com.projet.pp.model.ProjectChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectChatMessageRepository extends JpaRepository<ProjectChatMessage, Long> {
    List<ProjectChatMessage> findByProject(Project project);
}
