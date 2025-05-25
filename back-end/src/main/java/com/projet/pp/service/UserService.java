package com.projet.pp.service;
import com.projet.pp.model.*;
import com.projet.pp.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.projet.pp.model.User;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder; // <-- ADD THIS LINE


    @Autowired private ChatAttachmentRepository attachmentRepo;
    @Autowired private ChatMessageRepository messageRepo;
    @Autowired private ProjectRepository projectRepo;
    @Autowired private projectInvitedUserRepository      invitedRepo;
    @Autowired private ProjectTesterAssignmentRepository assignRepo;
    @Autowired private TacheRepository                   tacheRepo;
@Autowired private NotificationService notificationService;
    LocalDateTime now = LocalDateTime.now();  // No additional imports needed

    private final Path uploadsRoot = Paths.get("uploads").toAbsolutePath().normalize();
    @Autowired
    private ChatMessageService chatMessageService;
    @Autowired
    private BugReportService bugReportService;
    @Autowired private BugReportRepository bugRepo;


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


        chatMessageService.deleteChatMessagesbyUserId(user.getId());
        notificationService.getNotificationsByUser(user);
        // Other fields remain unchanged
        user.setEmail("deleted_user_"+user.getId()+"@example.com");
        user.setUsername("deleted_user_"+user.getId());
        user.setSalaire(0);
        user.setDateEmbauche(LocalDate.of(1900, 1, 1));
        user.setNom("user");
        user.setPrenom("deleted");
        userRepository.save(user);
    }


    @Transactional
    public void deleteUserBySupervisor(Long userId) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // 1) Chats privés : attachments + messages + suppression disque
        attachmentRepo.deleteByUserId(userId);
        messageRepo.deleteByUserId(userId);
        deleteDirectoryRecursively(uploadsRoot.resolve("chat").resolve(userId.toString()));

        // 2) Projets : réassignation + invitations
        projectRepo.reassignDeletedOwner(userId);
        invitedRepo.deleteByInvitedUserId(userId);

        // 3) Assignations testeurs / superviseurs
        assignRepo.reassignDeletedSuperviseur(userId);
        assignRepo.deleteByDeletedTesteur(userId);

        // 4) Tâches : réassignation + désaffectation
        tacheRepo.reassignDeletedCreator(userId);
        tacheRepo.deleteUserFromAssignedTo(userId);

        // 5) Enfin suppression de l’utilisateur
        userRepository.delete(u);
    }

    /**
     * Supprime récursivement un dossier et tout son contenu.
     * Ne fait rien si le dossier n'existe pas.
     */
    private void deleteDirectoryRecursively(Path dir) {
        try {
            if (Files.exists(dir)) {
                Files.walk(dir)
                        .sorted(Comparator.reverseOrder())
                        .map(Path::toFile)
                        .forEach(File::delete);
            }
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la suppression du dossier " + dir, e);
        }
    }


    @Transactional
    public User updateBySupervisor(Long id, Map<String,String> data, Long currentSupervisorId) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        User supervisor = userRepository.findById(currentSupervisorId)
                .orElseThrow(() -> new RuntimeException("Superviseur non trouvé"));

        // 1) Interdire la modif d'un autre superviseur
        if (target.getRole().getId() == 3 && supervisor.getRole().getId() == 3) {
            throw new RuntimeException("Accès refusé : un superviseur ne peut pas modifier un autre superviseur");
        }

        // 2) Seuls ces champs sont modifiables :
        if (data.containsKey("nom"))           target.setNom(data.get("nom"));
        if (data.containsKey("prenom"))        target.setPrenom(data.get("prenom"));
        if (data.containsKey("email"))         target.setEmail(data.get("email"));
        if (data.containsKey("genre"))         target.setGenre(data.get("genre"));
        if (data.containsKey("ncin"))          target.setNcin(data.get("ncin"));
        if (data.containsKey("salaire"))       target.setSalaire(Double.parseDouble(data.get("salaire")));
        if (data.containsKey("dateEmbauche"))  target.setDateEmbauche(LocalDate.parse(data.get("dateEmbauche")));

        return userRepository.save(target);
    }


    public List<User> getUsersByRoleId(Long roleId) {
        return userRepository.findAllActiveByRoleId(roleId);
    }


    public List<User> getUsersByIds(List<Long> ids) {
        return userRepository.findAllById(ids);  // Récupère les utilisateurs par leurs IDs
    }


    public Optional<User> getUserByIdOptional(Integer id) {
        if (id == null) {
            return Optional.empty();
        }
        return userRepository.findById(id.longValue());
    }

    public List<?> getAllDeveloperStats() {
//Filter from the line before where the user.nom="user" user.prenom=deleted
        List<User> devs = userRepository.findAllActiveByRoleId(1L);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastWeek = now.minusWeeks(1);
        LocalDateTime lastMonth = now.minusMonths(1);
        LocalDateTime lastYear = now.minusYears(1);
        // 2) build DTO per dev
        return devs.stream().map(dev -> {
            Long  id    = dev.getId();
            long  dp    = projectRepo.countByUser_Id(id);
            long  done  = projectRepo.countByUser_IdAndStatus(id, 5 );
            long  test  = projectRepo.countByUser_IdAndStatus(id, 2);
            long projectsLastMonth= projectRepo.countByUser_IdAndStatusAndUpdatedAtBetween(id, 5, now.minusMonths(1),now);
            long bugs = bugRepo.countByProject_User_Id(id);
            long bugsLastWeek = bugRepo.countByProject_User_IdAndCreatedAtAfter(id, lastWeek);
            long bugsLastMonth = bugRepo.countByProject_User_IdAndCreatedAtAfter(id, lastMonth);
            long bugsLastYear = bugRepo.countByProject_User_IdAndCreatedAtAfter(id, lastYear);

            long projectsLastYear= projectRepo.countByUser_IdAndStatusAndUpdatedAtBetween(id, 5,now.minusYears(1),now);
            long activeTasks       = tacheRepo.countActiveTasks(id);
            long activeProjects    = tacheRepo.countActiveProjects(id);

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
            stats.put("bugs",   bugs);
            stats.put("bugsLastWeek",   bugsLastWeek);
            stats.put("bugsLastMounth",   bugsLastMonth);
            stats.put("bugsLastYear",   bugsLastYear);


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
        long activeTasks       = tacheRepo.countActiveTasks(id);
        long activeProjects    = tacheRepo.countActiveProjects(id);

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


        long total   = assignRepo.countByProject_User_Id(id);
        long APPROVED = assignRepo
                .countByProject_User_IdAndDecision(id, TestApproval.APPROVED);
        long failed  = assignRepo
                .countByProject_User_IdAndDecision(id, TestApproval.REJECTED);

        return Map.of(
                "total",   total,
                "success", APPROVED,
                "failed",  failed
        );
    }


    public List<?> getAllTesterStats() {

        List<User> testers = userRepository.findAllActiveByRoleId(2L);

        // 2) build DTO per dev
        return testers.stream().map(tester -> {
            Long  id    = tester.getId();
            long testedProjects = assignRepo.countByTesteur_Id(id);
            long totalTests     = assignRepo.countByTesteur_Id(id);
            long acceptedTests    = assignRepo.countByTesteur_IdAndDecision(id,TestApproval.APPROVED);

            long failedTests    = assignRepo.countByTesteur_IdAndDecision(id,TestApproval.REJECTED);

            long activeTasks       = assignRepo.countActiveTasks(id);
            long activeProjects    = assignRepo.countActiveProjects(id);

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
        long testedProjects = assignRepo.countByTesteur_Id(id);
        long totalTests     = assignRepo.countByTesteur_Id(id);
        long acceptedTests    = assignRepo.countByTesteur_IdAndDecision(id,TestApproval.APPROVED);

        long failedTests    = assignRepo.countByTesteur_IdAndDecision(id,TestApproval.REJECTED);

        long activeTasks       = assignRepo.countActiveTasks(id);
        long activeProjects    = assignRepo.countActiveProjects(id);

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


        long total   = assignRepo.countByProject_User_Id(id);
        long approved = assignRepo
                .countByTesteur_IdAndDecision(id, TestApproval.APPROVED);
        long failed  = assignRepo
                .countByTesteur_IdAndDecision(id, TestApproval.REJECTED);

        return Map.of(
                "total",   total,
                "success", approved,
                "failed",  failed
        );
    }
    public List<User> getAllActiveUsers() {
        return userRepository.findAllActiveUsers();
    }




}
