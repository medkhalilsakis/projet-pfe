package com.projet.pp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name="project_testeur_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectTesterAssignment {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name="project_id", nullable=false)
    private Project project;

    @ManyToOne @JoinColumn(name="testeur_id", nullable=false)
    private User testeur;

    @ManyToOne
    @JoinColumn(name="superviseur_id", nullable=false)
    private User superviseur;

    @Column(name="date_designation", nullable=false)
    private LocalDate dateDesignation = LocalDate.now();

    @Column(name="numero_testeur", nullable=false)
    private int numeroTesteur;

    @Column(name="cas_test_path")
    private String casTestPath;

    @Enumerated(EnumType.STRING)
    @Column(name="statut_test", nullable=false)
    private TestStatus statutTest = TestStatus.non_commence;

    public void setUpdatedAt(LocalDateTime now) {
    }

    public void setCreatedAt(LocalDateTime now) {

    }
}
