package com.projet.pp.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "utilisateur")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class User{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "date_embauche")
    private LocalDate dateEmbauche;

    private double salaire;

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    @JsonIgnoreProperties("hibernateLazyInitializer")
    private Role role;

    @Column(nullable = false, unique = true)
    private String ncin;

    @Column(nullable = false)
    private String genre;


    private boolean online;
    private LocalDateTime lastSeen;

    public User(String nom, String prenom, String username, String email, String password,
                LocalDate dateEmbauche, double salaire, Role role, String ncin, String genre) {
        this.nom = nom;
        this.prenom = prenom;
        this.username = username;
        this.email = email;
        this.password = password;
        this.dateEmbauche = dateEmbauche;
        this.salaire = salaire;
        this.role = role;
        this.ncin = ncin;
        this.genre = genre;
    }
    public User(Long id) {
        this.id = id;
    }
}