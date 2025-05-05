package com.projet.pp.repository;

import com.projet.pp.model.UploadedTestCase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UploadedTestCaseRepository extends JpaRepository<UploadedTestCase, Long> {
    List<UploadedTestCase> findByProjectId(Long projectId);
}
