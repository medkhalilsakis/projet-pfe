package com.projet.pp.service;

import com.projet.pp.model.PauseRequest;
import com.projet.pp.model.PauseStatus;
import com.projet.pp.model.Project;
import com.projet.pp.repository.PauseRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PauseRequestService {
    @Autowired private PauseRequestRepository pauseRequestRepo;
    @Autowired private ProjectService projectService;

    @Transactional
    public PauseRequest create(Long projectId, Long userId, String reason) {
        Project project = projectService.getProjectById(projectId);
        PauseRequest pr = new PauseRequest();
        pr.setProject(project);
        pr.setRequesterId(userId);
        pr.setReason(reason);
        // pr.setStatus(PauseStatus.PENDING) déjà en défaut
        return pauseRequestRepo.save(pr);
    }

    @Transactional
    public PauseRequest updateStatus(
            Long projectId,
            Long pauseRequestId,
            PauseStatus newStatus,
            Long supervisorId
    ) {
        PauseRequest pr = pauseRequestRepo.findById(pauseRequestId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée : " + pauseRequestId));

        pr.setStatus(newStatus);
        pr.setSupervisorId(supervisorId);
        pr.setHandledAt(LocalDateTime.now());

        // Si APPROVED, on bascule aussi le projet en statut \"en pause\" (ex : 55)
        if (newStatus == PauseStatus.APPROVED) {
            Project proj = pr.getProject();
            proj.setStatus(55);
            projectService.commitProject(
                    proj.getId(),
                    proj.getName(),
                    proj.getType(),
                    proj.getDescription(),
                    proj.getVisibilite(),
                    String.valueOf(proj.getStatus())
            );
        }

        return pauseRequestRepo.save(pr);
    }

    @Transactional(readOnly = true)
    public List<PauseRequest> findByProject(Long projectId) {
        return pauseRequestRepo.findByProjectId(projectId);
    }
}
