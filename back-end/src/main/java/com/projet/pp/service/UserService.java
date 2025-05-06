package com.projet.pp.service;

import com.projet.pp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.projet.pp.model.User;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;


    @Autowired private ChatAttachmentRepository attachmentRepo;
    @Autowired private ChatMessageRepository messageRepo;
    @Autowired private ProjectRepository projectRepo;
    @Autowired private projectInvitedUserRepository      invitedRepo;
    @Autowired private ProjectTesterAssignmentRepository assignRepo;
    @Autowired private TacheRepository                   tacheRepo;

    private final Path uploadsRoot = Paths.get("uploads").toAbsolutePath().normalize();


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
        return userRepository.findByRoleId(roleId);
    }


    public List<User> getUsersByIds(List<Long> ids) {
        return userRepository.findAllById(ids);  // Récupère les utilisateurs par leurs IDs
    }

}
