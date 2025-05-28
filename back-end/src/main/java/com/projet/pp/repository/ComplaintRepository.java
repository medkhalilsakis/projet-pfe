package com.projet.pp.repository;

import com.projet.pp.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByProjectId(Long projectId);
}
