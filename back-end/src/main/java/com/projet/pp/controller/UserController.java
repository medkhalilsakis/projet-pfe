package com.projet.pp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.projet.pp.model.User;
import com.projet.pp.service.UserService;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

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

    // POST /api/users : créer un nouvel utilisateur
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return new ResponseEntity<>(userService.createUser(user), HttpStatus.CREATED);
    }

    // PUT /api/users/{id} : mettre à jour un utilisateur existant
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return new ResponseEntity<>(userService.updateUser(id, user), HttpStatus.OK);
    }

    // DELETE /api/users/{id} : supprimer un utilisateur
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        User user = userService.getUserByUsername(username);
        return user != null ?
                ResponseEntity.ok(user) :
                ResponseEntity.notFound().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Authentification avec Spring Security
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Récupération de l'utilisateur depuis la base
            Utilisateur utilisateur = utilisateurRepository.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            // Génération et envoi de l'OTP
            otpService.generateAndSendOTP(utilisateur);

            return ResponseEntity.ok(new MessageResponse("OTP envoyé à votre email"));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Identifiants invalides"));
        }
    }

    // Endpoint pour vérifier l'OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOTP(@RequestBody OTPRequest otpRequest) {
        Utilisateur utilisateur = utilisateurRepository.findByUsername(otpRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        boolean isValid = otpService.verifyOTP(utilisateur, otpRequest.getOtpCode());
        if (isValid) {
            // Génération d'un token JWT ou autre méthode d'authentification
            String token = generateJWTToken(utilisateur);
            return ResponseEntity.ok(new JwtResponse(token));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("OTP invalide ou expiré"));
        }
    }

    // Méthode fictive pour générer un token JWT
    private String generateJWTToken(User utilisateur) {
        // Implémentez ici la génération de token avec votre librairie JWT préférée
        return "fake-jwt-token";
    }
}
