package com.projet.pp.repository;

import com.projet.pp.model.ProjectFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectFileRepository extends JpaRepository<ProjectFile, Long> {
    List<ProjectFile> findByProjectId(Long projectId);
    List<ProjectFile> findByProjectIdAndParentId(Long projectId, Long parentId);
}
