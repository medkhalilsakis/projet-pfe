package com.projet.pp.service;

import com.projet.pp.dto.FinishedProjectDTO;
import com.projet.pp.model.*;
import com.projet.pp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.stereotype.Service;

@Service
public class TesterAssignmentService {

    @Autowired
    private ProjectRepository projectRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ProjectTesterAssignmentRepository assignmentRepo;

    /**
     * Retourne tous les projets au statut donné.
     */
    public List<Project> findProjectsByStatus(int status) {
        return projectRepo.findByStatus(status);
    }

    /**
     * Retourne toutes les désignations pour un projet.
     */
    public List<ProjectTesterAssignment> getAssignments(Long projectId) {
        return assignmentRepo.findByProjectId(projectId);
    }

    /**
     * Désigne un ou plusieurs testeurs sur un projet.
     * Si on passe status = TestStatus.non_commence, on lève en attente,
     * pour lancer la phase de test status projet -> 2.
     */
    @Transactional
    public void assignTesters(Long projectId, List<Long> testeurIds, Long superviseurId) {
        Project projet = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet introuvable"));
        User superviseur = userRepo.findById(superviseurId)
                .orElseThrow(() -> new RuntimeException("Superviseur introuvable"));

        // 1) On supprime les anciennes désignations si on reprend à zéro
        assignmentRepo.deleteByProjectId(projectId);

        // 2) On recrée les désignations
        int num = 1;
        for (Long tid : testeurIds) {
            User t = userRepo.findById(tid)
                    .orElseThrow(() -> new RuntimeException("Testeur introuvable: " + tid));
            ProjectTesterAssignment pa = new ProjectTesterAssignment();
            pa.setProject(projet);
            pa.setSuperviseur(superviseur);
            pa.setTesteur(t);
            pa.setDateDesignation(LocalDate.now());
            pa.setNumeroTesteur(num++);
            pa.setStatutTest(TestStatus.non_commence);
            assignmentRepo.save(pa);
        }

        // 3) On met à jour le statut du projet -> en phase de test
        projet.setStatus(2);
        projectRepo.save(projet);
    }

    /**
     * Met le projet en pause (status 55) ou clôture (99).
     */
    @Transactional
    public void changeProjectTestPhase(Long projectId, TestStatus newPhase) {
        Project projet = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet introuvable"));
        int s = switch (newPhase) {
            case en_pause -> 55;
            case cloture -> 99;
            default -> throw new IllegalArgumentException("Phase invalide pour pause/close");
        };
        projet.setStatus(s);
        projectRepo.save(projet);
    }

    /**
     * Relance la phase de test (remet statut 2).
     */
    @Transactional
    public void restartTestPhase(Long projectId) {
        Project projet = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet introuvable"));

        // Réinitialise le statut à 2 (en phase de test)
        projet.setStatus(2);
        projectRepo.save(projet);
    }


    public List<Project> findProjectsInPendingStateWithoutTesters() {
        List<Project> projects = projectRepo.findByStatus(1);  // Trouver les projets en attente (status = 1)

        // Filtrer les projets qui n'ont pas de testeurs assignés
        List<Project> filteredProjects = new ArrayList<>();
        for (Project project : projects) {
            if (project.getAssignments().isEmpty()) {
                filteredProjects.add(project);
            }
        }
        return filteredProjects;
    }

    public List<ProjectTesterAssignment> getAssignmentsByTesteur(Long testeurId) {
        return assignmentRepo.findByTesteurId(testeurId);
    }
}