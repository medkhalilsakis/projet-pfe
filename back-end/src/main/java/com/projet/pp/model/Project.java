package com.projet.pp.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Propriétaire du projet
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    // Type du projet (optionnel)
    @Column
    private String type;

    // Description du projet
    @Column(columnDefinition = "TEXT")
    private String description;

    // Visibilité : par exemple "public", "private", "limited"
    @Column(nullable = false)
    private String visibility;

    // Indique si le projet est commité (finalisé)
    @Column
    private boolean committed = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Liste des fichiers associés au projet
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProjectFile> files = new ArrayList<>();

    // Liste des utilisateurs invités (si visibilité limitée)
    @ManyToMany
    @JoinTable(name = "project_invited_users",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    private List<User> invitedUsers = new ArrayList<>();

    // Constructeur minimal
    public Project(String name) {
        this.name = name;
    }
}
