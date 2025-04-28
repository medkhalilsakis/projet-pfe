// src/main/java/com/projet/pp/dto/InvitedUserDTO.java
package com.projet.pp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvitedUserDTO {
    /** L’ID de l’invitation (clé primaire) */
    private Long id;

    /** L’ID de l’utilisateur invité */
    private Long userId;

    /** Prénom de l’utilisateur invité */
    private String prenom;

    /** Nom de l’utilisateur invité */
    private String nom;

    /** Statut de l’invitation (“pending”, “accepted”, etc.) */
    private String status;

    /** Date et heure de l’invitation */
    private LocalDateTime invitedAt;
}
