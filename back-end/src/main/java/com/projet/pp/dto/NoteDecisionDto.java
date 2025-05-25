package com.projet.pp.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoteDecisionDto {
    private Integer id;
    private String typeNote;
    private String titre;
    private String contenu;
    private String statut;
    private Integer superviseurId;
    private String remarque;
    private String fichierJoint;
}
