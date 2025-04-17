package com.projet.pp.repository;

import com.projet.pp.model.Project;
import com.projet.pp.model.ProjectFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectFileRepository extends JpaRepository<ProjectFile, Long> {
    Optional<ProjectFile> findByProjectAndNameAndParent(Project project, String name, ProjectFile parent);

    List<ProjectFile> findByProjectId(Long projectId);
    List<ProjectFile> findByProjectIdAndParentId(Long projectId, Long parentId);
}
