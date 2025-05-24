package com.projet.pp.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notes_decisions")
@Getter @Setter @NoArgsConstructor
@AllArgsConstructor @Builder
public class NoteDecision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "type_note", length = 50, nullable = false)
    private String typeNote;

    @Column(nullable = false, length = 255)
    private String titre;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenu;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @Column(length = 50, nullable = false)
    private String statut = "en cours";

    // Clé étrangère vers utilisateurs(id)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "superviseur_id", referencedColumnName = "id")
    private User superviseur;

    @Column(columnDefinition = "TEXT")
    private String remarque;

    @Column(name = "fichier_joint", length = 255)
    private String fichierJoint;

}