package com.projet.pp.repository;

import com.projet.pp.model.PauseRequest;
import com.projet.pp.model.PauseStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PauseRequestRepository extends JpaRepository<PauseRequest, Long> {
    List<PauseRequest> findByProjectId(Long projectId);
    long countByStatus(PauseStatus status);

}
