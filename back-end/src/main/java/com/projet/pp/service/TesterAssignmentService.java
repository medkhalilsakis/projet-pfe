package com.projet.pp.service;

import com.projet.pp.model.Project;
import com.projet.pp.model.ProjectTesterAssignment;
import com.projet.pp.model.TestStatus;
import com.projet.pp.model.User;
import com.projet.pp.repository.ProjectRepository;
import com.projet.pp.repository.ProjectTesterAssignmentRepository;
import com.projet.pp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TesterAssignmentService {

    @Autowired
    private ProjectRepository projectRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ProjectTesterAssignmentRepository assignRepo;

    public List<Project> getPendingProjects() {
        return projectRepo.findByStatus(1);
    }

    public List<User> getAllTesters() {
        return userRepo.findByRoleId(2L);
    }

    public long countInProgress(Long testeurId) {
        return assignRepo.countByTesteurIdAndStatutTest(testeurId, TestStatus.en_cours);
    }

    @Transactional
    public void assignTester(Long projectId, Long testeurId, Long superviseurId) {
        // Récupération des entités
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        User testeur = userRepo.findById(testeurId)
                .orElseThrow(() -> new RuntimeException("Testeur non trouvé"));
        User superviseur = userRepo.findById(superviseurId)
                .orElseThrow(() -> new RuntimeException("Superviseur non trouvé"));

        // Vérifier si le testeur est déjà affecté pour ce projet
        if (assignRepo.findByProjectIdAndTesteurId(projectId, testeurId).isPresent()) {
            throw new RuntimeException("Ce testeur est déjà assigné à ce projet");
        }

        // Calcul du numéro du testeur pour ce projet : incrémentation en fonction du nombre d'affectations existantes
        int numero = assignRepo.findByProjectId(projectId).size() + 1;
        if (numero > 2) {
            throw new RuntimeException("Le maximum de 2 testeurs est déjà assigné à ce projet");
        }

        // Création de l'affectation
        ProjectTesterAssignment assignment = new ProjectTesterAssignment();
        assignment.setProject(project);
        assignment.setTesteur(testeur);
        assignment.setSuperviseur(superviseur);
        assignment.setNumeroTesteur(numero);
        assignment.setStatutTest(TestStatus.en_cours);
        assignment.setDateDesignation(LocalDate.from(LocalDateTime.now()));
        assignment.setCreatedAt(LocalDateTime.now());
        assignment.setUpdatedAt(LocalDateTime.now());
        assignRepo.save(assignment);

        // Mise à jour du statut du projet : passage en testing (status = 2)
        project.setStatus(2);
        projectRepo.save(project);
    }



    @Transactional
    public void removeTester(Long assignmentId) {
        assignRepo.deleteById(assignmentId);
    }

    @Transactional
    public void updateTester(Long assignmentId, Long newTesterId) {
        ProjectTesterAssignment assignment = assignRepo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Affectation non trouvée"));
        User newTester = userRepo.findById(newTesterId)
                .orElseThrow(() -> new RuntimeException("Testeur non trouvé"));
        assignment.setTesteur(newTester);
        assignment.setUpdatedAt(LocalDateTime.now());
        assignRepo.save(assignment);
    }

    @Transactional
    public void interruptTestingPhase(Long projectId) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        // Supprime toutes les affectations pour ce projet
        assignRepo.deleteByProjectId(projectId);
        // Met à jour le statut du projet en "clôturé" (status = 3)
        project.setStatus(3);
        projectRepo.save(project);
    }

    public List<Project> getTestingProjects() {
        return projectRepo.findByStatus(2);
    }


    @Transactional
    public void resumeTestingPhase(Long projectId, List<Long> testerIds, Long superviseurId) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        int currentAssignments = assignRepo.findByProjectId(projectId).size();
        // Pour chaque testeur sélectionné, on crée une affectation tant que le maximum (2) n'est pas atteint
        for (Long testerId : testerIds) {
            // Vérifier si le testeur est déjà affecté
            if (assignRepo.findByProjectIdAndTesteurId(projectId, testerId).isPresent()) {
                continue; // Passe au testeur suivant
            }
            if (currentAssignments >= 2) {
                break;
            }
            User testeur = userRepo.findById(testerId)
                    .orElseThrow(() -> new RuntimeException("Testeur non trouvé"));
            User superviseur = userRepo.findById(superviseurId)
                    .orElseThrow(() -> new RuntimeException("Superviseur non trouvé"));
            ProjectTesterAssignment assignment = new ProjectTesterAssignment();
            assignment.setProject(project);
            assignment.setTesteur(testeur);
            assignment.setSuperviseur(superviseur);
            assignment.setNumeroTesteur(++currentAssignments);
            assignment.setStatutTest(TestStatus.en_cours);
            assignment.setDateDesignation(LocalDate.from(LocalDateTime.now()));
            assignment.setCreatedAt(LocalDateTime.now());
            assignment.setUpdatedAt(LocalDateTime.now());
            assignRepo.save(assignment);
        }
        // Mise à jour du statut du projet : passage en testing (status = 2)
        project.setStatus(2);
        projectRepo.save(project);
    }


}
