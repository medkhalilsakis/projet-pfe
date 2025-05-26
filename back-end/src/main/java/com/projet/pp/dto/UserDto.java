package com.projet.pp.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.*;

/**
 * Data Transfer Object for User entity
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String nom;
    private String prenom;
    private String username;
    private String email;
    private String ncin;
    private String genre;
    private LocalDate dateEmbauche;
    private double salaire;
    private Long roleId;
    private String roleLibelle;
    private boolean online;
    private LocalDateTime lastSeen;

    /**
     * Convert an entity User to a UserDto
     */
    public static UserDto fromEntity(com.projet.pp.model.User user) {
        if (user == null) return null;
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setNcin(user.getNcin());
        dto.setGenre(user.getGenre());
        dto.setDateEmbauche(user.getDateEmbauche());
        dto.setSalaire(user.getSalaire());
        if (user.getRole() != null) {
            dto.setRoleId(user.getRole().getId());
            dto.setRoleLibelle(user.getRole().getLibelle());
        }
        dto.setOnline(user.isOnline());
        dto.setLastSeen(user.getLastSeen());
        return dto;
    }

    /**
     * Convert a UserDto to a User entity.
     * Note: sets only simple fields; role must be set separately.
     */
    public com.projet.pp.model.User toEntity() {
        com.projet.pp.model.User user = new com.projet.pp.model.User();
        user.setId(this.id);
        user.setNom(this.nom);
        user.setPrenom(this.prenom);
        user.setUsername(this.username);
        user.setEmail(this.email);
        user.setNcin(this.ncin);
        user.setGenre(this.genre);
        user.setDateEmbauche(this.dateEmbauche);
        user.setSalaire(this.salaire);
        // password NOT mapped here for security reasons
        return user;
    }
}
