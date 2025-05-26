package com.projet.pp.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.*;

@Entity
@Table(name = "initiation_phases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InitiationPhase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tache_id", nullable = false)
    private Tache tache;

    // Partie Introduction / Objectifs
    @Column(columnDefinition = "TEXT")
    private String introduction;

    @Column(columnDefinition = "TEXT")
    private String objectifs;

    // Recueil des exigences
    @OneToMany(
            mappedBy = "phase",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Exigence> exigences = new ArrayList<>();

    // Analyse de faisabilité
    @OneToOne(
            mappedBy = "phase",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private AnalyseFaisabilite faisabilite;

    // Cahier des Charges
    @OneToOne(
            mappedBy = "phase",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private CahierDesCharges cahierDesCharges;

    // Planification (plusieurs phases possibles)
    @OneToMany(
            mappedBy = "phase",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<PlanificationPhase> plannings = new ArrayList<>();
}

