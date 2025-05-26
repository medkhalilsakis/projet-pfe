package com.projet.pp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "role")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String libelle;

    @Column
    private String description;



    public Role(String libelle, String description) {
        this.libelle = libelle;
        this.description = description;
    }
    public String getLibelle() {
        return libelle;
    }
}
