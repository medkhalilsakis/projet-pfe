package com.projet.pp.model;


import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;

@Entity
@Table(name = "taches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Tache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate deadline;

    private String outils;

    @Column(name = "creationDate")
    private LocalDate creationDate;

    @Enumerated(EnumType.STRING)
    private Status status;

    @ManyToOne
    @JoinColumn(name = "assignedTo", referencedColumnName = "id")
    private User assignedTo;
    @ManyToOne
    @JoinColumn(name = "assignedBy", referencedColumnName = "id")
    private User assignedBy;

    @Column(name = "project_details_pdf")
    private String projectDetailsPdf;

    @Column(name = "test_cases_pdf")
    private String testCasesPdf;

    @OneToOne
    @JoinColumn(name = "project_id", unique = true) // Ensures one-to-one
    private Project project;

    public enum Status {
        a_developper,
        en_test,
        suspendu,
        cloturé,
        terminé
    }

    // Getters and Setters

}
