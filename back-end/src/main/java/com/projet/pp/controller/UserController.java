package com.projet.pp.controller;

import com.projet.pp.model.Role;
import com.projet.pp.model.User;
import com.projet.pp.repository.RoleRepository;
import com.projet.pp.repository.UserRepository;
import com.projet.pp.service.OTPService;
import com.projet.pp.service.PasswordUtil;
import com.projet.pp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private OTPService otpService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        User user = userService.getUserByUsername(username);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(userService.searchUsers(query));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> signupData) {
        String nom = signupData.get("nom");
        String prenom = signupData.get("prenom");
        String username = signupData.get("username");
        String email = signupData.get("email");
        String rawPassword = signupData.get("password");
        String ncin = signupData.get("ncin");
        String genre = signupData.get("genre");

        String hashedPassword = passwordEncoder.encode(rawPassword);
        LocalDate dateEmbauche = LocalDate.parse(signupData.get("dateEmbauche"));
        double salaire = Double.parseDouble(signupData.get("salaire"));
        Long roleId = Long.parseLong(signupData.get("role_id"));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Rôle non trouvé"));

        User user = new User(nom, prenom, username, email, hashedPassword,
                dateEmbauche, salaire, role, ncin, genre);

        User createdUser = userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        try {
            String username = loginData.get("username");
            String encryptedPassword = loginData.get("password");
            String decryptedPassword = PasswordUtil.decrypt(encryptedPassword);

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            if (!passwordEncoder.matches(decryptedPassword, user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("message", "Identifiants invalides"));
            }

            // Authentification dans le contexte Spring Security
            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(username, decryptedPassword);
            SecurityContextHolder.getContext().setAuthentication(authToken);

            // Génération et envoi de l’OTP
            otpService.generateAndSendOTP(user);
            return ResponseEntity.ok(Collections.singletonMap("message", "OTP envoyé à votre email"));

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("message", "Erreur lors de l'authentification"));
        }
    }

    /**
     * Étape 1 de la réinitialisation : on ne fait que VALIDER l'OTP (sans le marquer comme utilisé).
     * L'utilisateur reste en mode 'reset' côté front.
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOTP(@RequestBody Map<String, String> body) {
        String identifier = body.get("username"); // login ou email
        Optional<User> optUser = userRepository.findByUsername(identifier);
        if (optUser.isEmpty()) {
            optUser = userRepository.findByEmail(identifier);
        }
        User user = optUser.orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        boolean valid = otpService.validateOTP(user, body.get("code"));
        if (valid) {
            return ResponseEntity.ok(Map.of("message", "OTP valide, vous pouvez réinitialiser"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "OTP invalide ou expiré"));
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id,
                                        @RequestBody Map<String, String> updateData) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        String username = updateData.get("username");
        userRepository.findByUsername(username)
                .filter(u -> !u.getId().equals(id))
                .ifPresent(u -> {
                    throw new RuntimeException("Nom d'utilisateur déjà utilisé");
                });

        existingUser.setNom(updateData.getOrDefault("nom", existingUser.getNom()));
        existingUser.setPrenom(updateData.getOrDefault("prenom", existingUser.getPrenom()));
        existingUser.setUsername(username);
        existingUser.setEmail(updateData.getOrDefault("email", existingUser.getEmail()));
        existingUser.setNcin(updateData.getOrDefault("ncin", existingUser.getNcin()));

        String rawPassword = updateData.get("password");
        if (rawPassword != null && !rawPassword.isBlank()) {
            existingUser.setPassword(passwordEncoder.encode(rawPassword));
        }
        if (updateData.containsKey("dateEmbauche")) {
            existingUser.setDateEmbauche(LocalDate.parse(updateData.get("dateEmbauche")));
        }
        if (updateData.containsKey("salaire")) {
            existingUser.setSalaire(Double.parseDouble(updateData.get("salaire")));
        }
        if (updateData.containsKey("role_id")) {
            Long roleId = Long.parseLong(updateData.get("role_id"));
            Role role = roleRepository.findById(roleId)
                    .orElseThrow(() -> new RuntimeException("Rôle non trouvé"));
            existingUser.setRole(role);
        }

        User updatedUser = userService.updateUser(id, existingUser);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email non trouvé"));

        otpService.generateAndSendOTP(user);
        return ResponseEntity.ok(Map.of("message", "Code envoyé sur votre email"));
    }

    /**
     * Étape 2 de la réinitialisation : on CONSOME l'OTP (mise à jour isUsed=true) et on change le mot de passe.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String email   = body.get("email");
        String code    = body.get("code");
        String newPwd  = body.get("newPassword");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email non trouvé"));

        // Cette méthode marque l'OTP comme utilisé
        boolean valid = otpService.verifyOTP(user, code);
        if (!valid) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Code OTP invalide ou expiré"));
        }

        // Hash et sauvegarde du nouveau mot de passe
        user.setPassword(passwordEncoder.encode(newPwd));
        userService.updateUser(user.getId(), user);
        return ResponseEntity.ok(Map.of("message", "Mot de passe réinitialisé"));
    }


    @DeleteMapping("/supervisor/{id}")
    public ResponseEntity<Void> deleteBySupervisor(@PathVariable Long id) {
        userService.deleteUserBySupervisor(id);
        return ResponseEntity.noContent().build();
    }


    @PutMapping("/supervisor/{id}")
    public ResponseEntity<?> updateBySupervisor(
            @PathVariable Long id,
            @RequestBody Map<String,String> updateData,
            Authentication auth
    ) {
        // Récupérez l'id du superviseur courant depuis le token JWT ou context
        String username = auth.getName();
        User current = userService.getUserByUsername(username);
        try {
            User updated = userService.updateBySupervisor(id, updateData, current.getId());
            return ResponseEntity.ok(updated);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", ex.getMessage()));
        }
    }



    @GetMapping("/role/{roleId}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable Long roleId) {
        List<User> list = userService.getUsersByRoleId(roleId);
        return ResponseEntity.ok(list);
    }
    @GetMapping("/devstats")
    public ResponseEntity<?> getDevStats() {
        List<?> devstats= userService.getAllDeveloperStats();
        System.out.println(devstats);
        return ResponseEntity.ok(devstats);
    }
    @GetMapping("/devstats/{id}")
    public ResponseEntity<?> getDevStatsByID(@PathVariable Long id) {
        Map<String, Object> devstats= userService.getDeveloperStatsById(id);
        System.out.println(devstats);
        return ResponseEntity.ok(devstats);
    }@GetMapping("/devstats/test/{id}")
    public ResponseEntity<?> getDevTestingStatsByID(@PathVariable Long id) {
        Map<String, Object> devstats= userService.getDevTestingStatsByID(id);
        System.out.println(devstats);
        return ResponseEntity.ok(devstats);
    }
    @GetMapping("/testerstats/{id}")
    public ResponseEntity<?> getTesterStats(@PathVariable Long id) {
        Map<String, Object> testerStats= userService.getTesterStats(id);
        System.out.println(testerStats);
        return ResponseEntity.ok(testerStats);
    }
    @GetMapping("/testerstats")
    public ResponseEntity<?> getTesterStats() {
        List<?> testersStats= userService.getAllTesterStats();
        System.out.println(testersStats);
        return ResponseEntity.ok(testersStats);
    }
}
