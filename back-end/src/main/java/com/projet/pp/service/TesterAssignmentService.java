package com.projet.pp.service;

import com.projet.pp.dto.FinishedProjectDTO;
import com.projet.pp.model.*;
import com.projet.pp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
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

    private final Path baseStorage = Paths.get("uploads/test-report").toAbsolutePath().normalize();

    public TesterAssignmentService() {
        try {
            Files.createDirectories(baseStorage);  // Créer les répertoires si nécessaire
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le répertoire pour les rapports de test", e);
        }
    }

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
        // 1. Mettre à jour le statut du projet
        Project projet = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet introuvable"));

        // Déterminer la nouvelle valeur du statut du projet en fonction de la phase
        int s = switch (newPhase) {
            case en_cours -> 2;
            case en_pause -> 55;
            case cloture -> 99;
            case termine -> 3;
            default -> throw new IllegalArgumentException("Phase invalide pour pause/close");
        };

        // Mettre à jour le statut du projet
        projet.setStatus(s);
        projectRepo.save(projet);

        // 2. Mettre à jour le statut des testeurs associés à ce projet
        List<ProjectTesterAssignment> assignments = assignmentRepo.findByProjectId(projectId);

        for (ProjectTesterAssignment assignment : assignments) {
            // Si le statut du projet est "en_cours", mettre à jour le statut des testeurs à "en_cours"
            if (newPhase == TestStatus.en_cours) {
                assignment.setStatutTest(TestStatus.en_cours); // Vous pouvez définir la valeur appropriée pour le statut des testeurs
            } else if (newPhase == TestStatus.en_pause) {
                assignment.setStatutTest(TestStatus.en_pause);
            } else if (newPhase == TestStatus.cloture) {
                assignment.setStatutTest(TestStatus.cloture);
            } else if (newPhase == TestStatus.termine) {
                assignment.setStatutTest(TestStatus.termine);
            }

            // Sauvegarder l'assignation mise à jour
            assignmentRepo.save(assignment);
        }
    }


    public String uploadReport(Long assignmentId, MultipartFile file) {
        try {
            // Vérifier si le fichier est vide
            if (file.isEmpty()) {
                throw new IllegalArgumentException("Le fichier est vide");
            }

            // Définir le chemin du fichier
            String fileName = assignmentId + "_" + file.getOriginalFilename();  // Utilisation de l'ID d'assignation pour le nom du fichier
            Path targetLocation = baseStorage.resolve(fileName);

            // Copier le fichier dans le répertoire de stockage
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return targetLocation.toString();  // Retourner le chemin du fichier téléchargé

        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'upload du rapport", e);
        }
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


    @Transactional
    public void updateTesterDecision(Long assignmentId, TestApproval decision, String rapportTestPath) {
        ProjectTesterAssignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        assignment.setDecision(decision);  // Mettre à jour la décision du testeur
        assignment.setRapportTestPath(rapportTestPath);  // Mettre à jour le rapport du testeur

        assignmentRepo.save(assignment);  // Sauvegarder l'assignation mise à jour
    }

    @Transactional
    public boolean canMoveToNextPhase(Long projectId) {
        List<ProjectTesterAssignment> assignments = assignmentRepo.findByProjectId(projectId);

        // Compter le nombre d'approbations
        long approvedCount = assignments.stream()
                .filter(assignment -> assignment.getDecision() == TestApproval.APPROVED)
                .count();

        // Vérifier si la majorité des testeurs ont approuvé
        int totalTesters = assignments.size();
        long majority = totalTesters % 2 == 0 ? totalTesters / 2 : (totalTesters / 2) + 1;

        return approvedCount >= majority;
    }


    @Transactional
    public void approvePhase(Long projectId) {
        if (canMoveToNextPhase(projectId)) {
            Project project = projectRepo.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            project.setStatus(3);  // Changer le statut du projet pour la phase d'acceptation (par exemple)
            projectRepo.save(project);
        } else {
            throw new RuntimeException("La majorité des testeurs n'a pas approuvé la phase.");
        }
    }


    public List<User> getTesteursExcept(Long projectId, Long excludeTesterId) {
        // Récupérer les IDs des testeurs assignés à ce projet
        List<Long> testerIds = assignmentRepo.findByProjectId(projectId).stream()
                .map(assignment -> assignment.getTesteur().getId())  // On récupère les IDs des testeurs
                .filter(id -> !id.equals(excludeTesterId))  // On exclut l'ID du testeur spécifié
                .collect(Collectors.toList());

        // Récupérer les détails des testeurs à partir de leurs IDs
        return userRepo.findAllById(testerIds);  // Rechercher tous les testeurs par leurs IDs
    }


}