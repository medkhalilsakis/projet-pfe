// src/main/java/com/example/demo/service/ComplaintService.java
package com.projet.pp.service;

import com.projet.pp.model.Complaint;
import com.projet.pp.repository.ComplaintRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;

    public ComplaintService(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    public Complaint saveComplaint(Complaint complaint) {
        return complaintRepository.save(complaint);
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    public Optional<Complaint> getComplaintById(Long id) {
        return complaintRepository.findById(id);
    }

    public List<Complaint> getComplaintsByProjectId(Long projectId) {
        return complaintRepository.findByProjectId(projectId);
    }
}
