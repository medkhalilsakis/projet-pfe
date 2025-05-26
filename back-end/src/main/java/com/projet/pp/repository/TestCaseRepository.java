package com.projet.pp.repository;

import com.projet.pp.model.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestCaseRepository extends JpaRepository<TestCase,Long> {
    List<TestCase> findByProjectId(Long projectId);
    boolean existsByProjectIdAndCaseNumber(Long projectId, String caseNumber);


    long countByProject_Id(Long projectId);
}
