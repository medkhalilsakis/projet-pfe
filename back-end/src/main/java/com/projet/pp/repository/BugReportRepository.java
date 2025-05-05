package com.projet.pp.repository;

import com.projet.pp.model.BugReport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BugReportRepository extends JpaRepository<BugReport,Long> {}
