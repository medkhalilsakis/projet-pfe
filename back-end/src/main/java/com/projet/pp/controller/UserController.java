package com.projet.pp.controller;

import com.projet.pp.model.Role;
import com.projet.pp.model.User;
import com.projet.pp.repository.RoleRepository;
import com.projet.pp.service.OTPService;
import com.projet.pp.service.PasswordUtil;
import com.projet.pp.service.UserService;
import com.projet.pp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

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
        return new ResponseEntity<>(userService.getAllUsers(), HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String query) {
        List<User> users = userService.searchUsers(query);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return new ResponseEntity<>(userService.getUserById(id), HttpStatus.OK);
    }

    // POST /api/users/signup : création d'un nouvel utilisateur
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> signupData) {
        String nom = signupData.get("nom");
        String prenom = signupData.get("prenom");
        String username = signupData.get("username");
        String email = signupData.get("email");
        String rawPassword = signupData.get("password");
        String ncin = signupData.get("ncin");
        String genre = signupData.get("genre");

        // Hachage du mot de passe avec BCrypt
        String hashedPassword = passwordEncoder.encode(rawPassword);

        // Conversion de la date d'embauche (format: yyyy-MM-dd)
        LocalDate dateEmbauche = LocalDate.parse(signupData.get("dateEmbauche"));

        // Conversion du salaire
        double salaire = Double.parseDouble(signupData.get("salaire"));

        // Récupération du rôle depuis l'ID
        Long roleId = Long.parseLong(signupData.get("role_id"));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Rôle non trouvé"));

        User user = new User(nom, prenom, username, email, hashedPassword, dateEmbauche, salaire, role, ncin, genre);

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


            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(username, decryptedPassword);
            SecurityContextHolder.getContext().setAuthentication(authToken);


            otpService.generateAndSendOTP(user);

            return ResponseEntity.ok(Collections.singletonMap("message", "OTP envoyé à votre email"));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("message", "Erreur lors du décryptage ou de l'authentification"));
        }
    }


    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOTP(
            @RequestParam String username,
            @RequestParam String code
    ) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        boolean isValid = otpService.verifyOTP(user, code);

        if (isValid) {
            return ResponseEntity.ok(Map.of("message", "OTP validé, connexion réussie"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "OTP invalide ou expiré"));
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> updateData) {
        User existingUser = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        String username = updateData.get("username");
        User existingUserWithUsername = userRepository.findByUsername(username).orElse(null);
        if (existingUserWithUsername != null && !existingUserWithUsername.getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Nom d'utilisateur déjà utilisé"));
        }

        existingUser.setNom(updateData.getOrDefault("nom", existingUser.getNom()));
        existingUser.setPrenom(updateData.getOrDefault("prenom", existingUser.getPrenom()));
        existingUser.setUsername(username);
        existingUser.setEmail(updateData.getOrDefault("email", existingUser.getEmail()));
        existingUser.setNcin(updateData.getOrDefault("ncin", existingUser.getNcin()));

        String rawPassword = updateData.get("password");
        if (rawPassword != null && !rawPassword.trim().isEmpty()) {
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
            Role role = roleRepository.findById(roleId).orElseThrow(() -> new RuntimeException("Rôle non trouvé"));
            existingUser.setRole(role);
        }

        User updatedUser = userService.updateUser(id, existingUser);
        return ResponseEntity.ok(updatedUser);
    }
}
