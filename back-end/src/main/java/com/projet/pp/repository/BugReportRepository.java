package com.projet.pp.repository;

import com.projet.pp.model.BugReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface BugReportRepository extends JpaRepository<BugReport, Long> {
    List<BugReport> findByProjectId(Long projectId);

    Long countByProject_User_Id(Long userId);
    Long countByProject_User_IdAndCreatedAtAfter(Long userId, LocalDateTime date);
    Long countByCreatedAtAfter(LocalDateTime date);

}