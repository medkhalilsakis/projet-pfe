package com.projet.pp.repository;

import com.projet.pp.model.BugReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BugReportRepository extends JpaRepository<BugReport, Long> {
    List<BugReport> findByProjectId(Long projectId);
}