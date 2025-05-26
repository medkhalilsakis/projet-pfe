package com.projet.pp.model;


import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "taches")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @ToString
public class Tache {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
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
    @JoinColumn(name = "assigned_by")
    private User assignedBy;

    private String projectDetailsPdf;

    @ManyToMany
    @JoinTable(
            name = "tache_assigne",
            joinColumns = @JoinColumn(name = "tache_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> assignedTo = new HashSet<>();

    @OneToMany(mappedBy = "tache", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TacheAttachment> attachments = new HashSet<>();


    @OneToOne
    @JoinColumn(name = "project_id", unique = true)
    private Project project;

    @OneToOne(mappedBy = "tache", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference  // expose la phase, mais pas le retour vers Tache
    private InitiationPhase initiationPhase;


    public enum Status {
        a_developper,
        en_cours,
        suspendu,
        cloturé,
        terminé
    }
}
