// src/main/java/com/projet/pp/model/TestScenario.java
package com.projet.pp.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "test_scenarios")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TestScenario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Relation vers le projet testé
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    /**
     * Superviseur ayant validé le scénario
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "superviseur_id", nullable = false)
    private User superviseur;

    @OneToMany(
            mappedBy = "scenario",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    @JsonManagedReference
    private List<TestScenarioStep> steps = new ArrayList<>();


    @Column(name = "attachment_name")
    private String attachmentName;

    @Column(name = "attachment_path")
    private String attachmentPath;

    @Column(name = "attachment_type")
    private String attachmentType;

    @Column(name = "attachment_size")
    private Long attachmentSize;

    /** Helper pour ajouter une étape et maintenir la bidirectionnalité */
    public void addStep(TestScenarioStep step) {
        step.setScenario(this);
        this.steps.add(step);
    }
}