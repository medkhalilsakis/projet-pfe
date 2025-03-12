package com.projet.pp.controller;

import com.projet.pp.model.User;
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
    private OTPService otpService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        User user = userService.getUserByUsername(username);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    // GET /api/users : lister tous les utilisateurs
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return new ResponseEntity<>(userService.getAllUsers(), HttpStatus.OK);
    }

    // GET /api/users/{id} : récupérer un utilisateur par son id
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

        // Hachage du mot de passe avec BCrypt
        String hashedPassword = passwordEncoder.encode(rawPassword);

        User user = new User();
        user.setNom(nom);
        user.setPrenom(prenom);
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(hashedPassword);
        // Vous pouvez définir d'autres champs comme dateEmbauche, salaire, role, etc.

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

            // Comparer le mot de passe déchiffré avec le hash stocké en base
            if (!passwordEncoder.matches(decryptedPassword, user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("message", "Identifiants invalides"));
            }

            // Facultatif : authentifier l'utilisateur dans le contexte Spring Security
            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(username, decryptedPassword);
            SecurityContextHolder.getContext().setAuthentication(authToken);

            // Générer et envoyer l'OTP par email
            otpService.generateAndSendOTP(user);

            return ResponseEntity.ok(Collections.singletonMap("message", "OTP envoyé à votre email"));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("message", "Erreur lors du décryptage ou de l'authentification"));
        }
    }

    // POST /api/users/verify-otp : vérifier le code OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOTP(
            @RequestParam String username,
            @RequestParam String code // Le nom doit correspondre au paramètre de la requête
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
}
