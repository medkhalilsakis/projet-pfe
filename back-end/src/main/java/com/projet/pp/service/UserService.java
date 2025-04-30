package com.projet.pp.service;

import com.projet.pp.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.projet.pp.model.User;
import com.projet.pp.model.TestOutcome;
import java.time.LocalDateTime;  // This is the crucial import
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProjectRepository projectRepo;
    @Autowired
    private TacheRepository taskRepo;
    @Autowired
    private ProjectTesterAssignmentRepository projectTesterAssignmentRepo;
    @Autowired
    private TestResultRepository testResultRepo;
    LocalDateTime now = LocalDateTime.now();  // No additional imports needed
    // Récupérer tous les utilisateurs
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Récupérer un utilisateur par son id
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'id: " + id));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public List<User> searchUsers(String query) {
        return userRepository.findByUsernameContainingIgnoreCase(query);
    }



    // Créer un nouvel utilisateur (mot de passe non crypté)
    public User createUser(User user) {
        return userRepository.save(user);
    }

    // Mettre à jour un utilisateur existant
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'id: " + id));

        user.setNom(userDetails.getNom());
        user.setPrenom(userDetails.getPrenom());
        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        user.setPassword(userDetails.getPassword()); // mot de passe en clair
        user.setDateEmbauche(userDetails.getDateEmbauche());
        user.setSalaire(userDetails.getSalaire());
        user.setRole(userDetails.getRole());

        return userRepository.save(user);
    }

    // Supprimer un utilisateur
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'id: " + id));
        userRepository.delete(user);
    }
    public List<?> getAllDeveloperStats() {

    List<User> devs = userRepository.findAllByRoleId(1L);

    // 2) build DTO per dev
        return devs.stream().map(dev -> {
        Long  id    = dev.getId();
        long  dp    = projectRepo.countByUser_Id(id);
        long  done  = projectRepo.countByUser_IdAndStatus(id, 5 );
        long  test  = projectRepo.countByUser_IdAndStatus(id, 2);
        long projectsLastMonth= projectRepo.countByUser_IdAndStatusAndUpdatedAtBetween(id, 5, now.minusMonths(1),now);


        long projectsLastYear= projectRepo.countByUser_IdAndStatusAndUpdatedAtBetween(id, 5,now.minusYears(1),now);
        long activeTasks       = taskRepo.countActiveTasks(id);
        long activeProjects    = taskRepo.countActiveProjects(id);

            Map<String, Object> stats = new LinkedHashMap<>();
            stats.put("name",              dev.getNom() + " " + dev.getPrenom());
            stats.put("devProjects",       dp);
            stats.put("completed",         done);
            stats.put("inTesting",         test);
            stats.put("salary",            dev.getSalaire());
            stats.put("activeTasks",       activeTasks);
            stats.put("activeProjects",   activeProjects);
            stats.put("projectsLastMonth",   projectsLastMonth);
            stats.put("projectsLastYear",   projectsLastYear);


            return stats;
        }).collect(Collectors.toList());
}
    public Map<String, Object> getDeveloperStatsById(Long id) {

            // 1) Find the developer
            User dev = userRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Developer not found with id: " + id));
        // 2) build DTO per dev
            long  dp    = projectRepo.countByUser_Id(id);
            long  done  = projectRepo.countByUser_IdAndStatus(id, 5 );
            long  test  = projectRepo.countByUser_IdAndStatus(id, 2);
            long projectsLastMonth= projectRepo.countByUser_IdAndStatusAndUpdatedAtBetween(id, 5, now.minusMonths(1),now);


            long projectsLastYear= projectRepo.countByUser_IdAndStatusAndUpdatedAtBetween(id, 5,now.minusYears(1),now);
            long activeTasks       = taskRepo.countActiveTasks(id);
            long activeProjects    = taskRepo.countActiveProjects(id);

            Map<String, Object> stats = new LinkedHashMap<>();
            stats.put("name",              dev.getNom() + " " + dev.getPrenom());
            stats.put("devProjects",       dp);
            stats.put("completed",         done);
            stats.put("inTesting",         test);
            stats.put("salary",            dev.getSalaire());
            stats.put("activeTasks",       activeTasks);
            stats.put("activeProjects",   activeProjects);
            stats.put("projectsLastMonth",   projectsLastMonth);
            stats.put("projectsLastYear",   projectsLastYear);


            return stats;
    }


    public  Map<String, Object> getDevTestingStatsByID(Long id) {

        User dev = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Developer not found with id: " + id));


        long total   = testResultRepo.countByAssignment_Project_User_Id(id);
        long success = testResultRepo
                .countByAssignment_Project_User_IdAndTestOutcome(id, TestOutcome.success);
        long failed  = testResultRepo
                .countByAssignment_Project_User_IdAndTestOutcome(id, TestOutcome.failure);

        return Map.of(
                "total",   total,
                "success", success,
                "failed",  failed
        );
    }


    public List<?> getAllTesterStats() {

        List<User> testers = userRepository.findAllByRoleId(2L);

        // 2) build DTO per dev
        return testers.stream().map(tester -> {
            Long  id    = tester.getId();
            long testedProjects = projectTesterAssignmentRepo.countByTesteur_Id(id);
            long totalTests     = testResultRepo.countByAssignment_Testeur_Id(id);
            long acceptedTests    = testResultRepo.countByAssignment_Testeur_IdAndTestOutcome(id,TestOutcome.success);

            long failedTests    = testResultRepo.countByAssignment_Testeur_IdAndTestOutcome(id,TestOutcome.failure);

            long activeTasks       = projectTesterAssignmentRepo.countActiveTasks(id);
            long activeProjects    = projectTesterAssignmentRepo.countActiveProjects(id);

            Map<String, Object> stats = new LinkedHashMap<>();
            stats.put("name",              tester.getNom() + " " + tester.getPrenom());
            stats.put("testedProjects",       testedProjects);
            stats.put("failedTests",         failedTests);
            stats.put("successTests",         acceptedTests);

            stats.put("totalTests",         totalTests);
            stats.put("salary",            tester.getSalaire());
            stats.put("activeTasks",       activeTasks);
            stats.put("activeProjects",   activeProjects);

            return stats;
        }).collect(Collectors.toList());
    }

    public  Map<String, Object>  getTesterStats(long id) {

        User tester = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Developer not found with id: " + id));
        // 2) build DTO per dev
            long testedProjects = projectTesterAssignmentRepo.countByTesteur_Id(id);
            long totalTests     = testResultRepo.countByAssignment_Testeur_Id(id);
            long acceptedTests    = testResultRepo.countByAssignment_Testeur_IdAndTestOutcome(id,TestOutcome.success);

            long failedTests    = testResultRepo.countByAssignment_Testeur_IdAndTestOutcome(id,TestOutcome.failure);

            long activeTasks       = projectTesterAssignmentRepo.countActiveTasks(id);
            long activeProjects    = projectTesterAssignmentRepo.countActiveProjects(id);

            Map<String, Object> stats = new LinkedHashMap<>();
            stats.put("name",              tester.getNom() + " " + tester.getPrenom());
            stats.put("testedProjects",       testedProjects);
            stats.put("failedTests",         failedTests);
            stats.put("successTests",         acceptedTests);

            stats.put("totalTests",         totalTests);
            stats.put("salary",            tester.getSalaire());
            stats.put("activeTasks",       activeTasks);
            stats.put("activeProjects",   activeProjects);

            return stats;

    }
    public  Map<String, Object> getTestingStatsByID(Long id) {

        User dev = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Developer not found with id: " + id));


        long total   = testResultRepo.countByAssignment_Project_User_Id(id);
        long success = testResultRepo
                .countByAssignment_Testeur_IdAndTestOutcome(id, TestOutcome.success);
        long failed  = testResultRepo
                .countByAssignment_Testeur_IdAndTestOutcome(id, TestOutcome.failure);

        return Map.of(
                "total",   total,
                "success", success,
                "failed",  failed
        );
    }
}
