package com.projet.pp.service;

import com.projet.pp.dto.FinishedProjectDTO;
import com.projet.pp.model.*;
import com.projet.pp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;

import java.nio.file.*;


@Service
public class TesterAssignmentService {

    @Autowired
    private ProjectRepository projectRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ProjectTesterAssignmentRepository assignmentRepo;
    @Autowired
    private TestAssignmentAttachmentRepository testAssignmentAttachmentRepository;

    private final Path baseStorage = Paths.get("uploads/test-report").toAbsolutePath().normalize();
    private final Path testStorage = Paths.get("uploads/test-assignment/project")            .toAbsolutePath().normalize();
    ;
    public TesterAssignmentService() {
        try {
            Files.createDirectories(baseStorage);  // Créer les répertoires si nécessaire
            Files.createDirectories(testStorage);
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
    public List<ProjectTesterAssignment> getAssignmentsByProjectId(Long projectId) {
        return assignmentRepo.findByProjectId(projectId);
    }

    /**
     * Désigne un ou plusieurs testeurs sur un projet.
     * Si on passe status = TestStatus.non_commence, on lève en attente,
     * pour lancer la phase de test status projet -> 2.
     */
    @Transactional
    public void assignTesters(Long projectId, List<Long> testeurIds, Long superviseurId,MultipartFile testCasesPdf) throws IOException {
        Project projet = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet introuvable"));
        User superviseur = userRepo.findById(superviseurId)
                .orElseThrow(() -> new RuntimeException("Superviseur introuvable"));

        // 1) On supprime les anciennes désignations si on reprend à zéro
        ProjectTesterAssignment assignment = assignmentRepo.findOneByProjectId(projectId);
        if (assignment != null) {
            testAssignmentAttachmentRepository.deleteById(assignment.getTestAssignmentAttachment().getId());

            assignmentRepo.deleteByProjectId(projectId);
        }
        // 2) On recrée les désignations
        int num = 1;

        // Création du dossier pour stocker les fichiers
        Path testCasesDir = testStorage.resolve(projectId.toString());
        Files.createDirectories(testCasesDir);

        // Enregistrement du PDF principal sur disque
        Path pdfPath = testCasesDir.resolve("testCases.pdf");
        testCasesPdf.transferTo(pdfPath);

        // Persist PDF principal en base comme attachment
        TestAssignmentAttachment pdfAtt = new TestAssignmentAttachment();
        pdfAtt.setFileName(testCasesPdf.getOriginalFilename());
        pdfAtt.setFilePath(pdfPath.toString());
        pdfAtt.setFileType(testCasesPdf.getContentType());
        pdfAtt.setFileSize(testCasesPdf.getSize());
        testAssignmentAttachmentRepository.save(pdfAtt);





        for (Long tid : testeurIds)

    {
        User t = userRepo.findById(tid)
                .orElseThrow(() -> new RuntimeException("Testeur introuvable: " + tid));
        ProjectTesterAssignment pa = new ProjectTesterAssignment();
        pa.setProject(projet);
        pa.setSuperviseur(superviseur);
        pa.setTesteur(t);
        pa.setDateDesignation(LocalDate.now());
        pa.setNumeroTesteur(num++);
        pa.setStatutTest(TestStatus.non_commence);
        pa.setTestAssignmentAttachment(pdfAtt);
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
    public List<ProjectTesterAssignment> getAssignmentsByTesteurAndStatus(Long testeurId ,TestStatus statusTest) {
        return assignmentRepo.findByTesteur_IdAndStatutTest(testeurId,statusTest);
    }

    @Transactional
    public void syncStatus(Long assignmentId) {
        ProjectTesterAssignment pta = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Tâche introuvable : " + assignmentId));

        Project p = pta.getProject();
        TestStatus newStatus;

            Integer projSt = p.getStatus();
            // votre mapping projet→tâche
            if (projSt == 2 || projSt == 3) {
                newStatus = TestStatus.en_cours;
            } else if (projSt == 4) {
                newStatus = TestStatus.termine;
            } else if (projSt == 55) {
                newStatus = TestStatus.en_pause;
            } else if (projSt == 99) {
                newStatus = TestStatus.cloture;
            } else {
                newStatus = TestStatus.non_commence;
            }


        if (pta.getStatutTest() != newStatus) {
            pta.setStatutTest(newStatus);
            assignmentRepo.save(pta);
        }
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

    public Map<String, Object> getTestStats() {
        long total   = assignmentRepo.count();
        long success = assignmentRepo.countByDecision(TestApproval.APPROVED);
        long failed  = assignmentRepo.countByDecision(TestApproval.REJECTED);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total",   total);
        stats.put("success", success);
        stats.put("failed",  failed);
        return stats;
    }
    public Map<String, Object> getTesterStats(long id) {
        long total   = assignmentRepo.countByTesteur_Id(id);
        long success = assignmentRepo.countByTesteur_IdAndDecision(id,TestApproval.APPROVED);
        long failed  = assignmentRepo.countByTesteur_IdAndDecision(id,TestApproval.REJECTED);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total",   total);
        stats.put("success", success);
        stats.put("failed",  failed);
        return stats;
    }
    @Transactional(readOnly = true)
    public Resource loadAttachmentAsResource(Long id) {
        TestAssignmentAttachment att = testAssignmentAttachmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
        try {
            Path file = Paths.get(att.getFilePath());
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found or not readable");
            }
        } catch (MalformedURLException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error reading file", ex);
        }
    }
    @Transactional
    public ProjectTesterAssignment getAssignment(Long testerId,Long projectId) {
        ProjectTesterAssignment pta = assignmentRepo.findByTesteur_IdAndProject_Id(testerId, projectId).orElseThrow(() -> new RuntimeException(" introuvable"));
        return pta;
    }

}