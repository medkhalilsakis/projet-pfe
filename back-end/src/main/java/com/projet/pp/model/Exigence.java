package com.projet.pp.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "exigences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Exigence {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String fonctionnelle;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String nonFonctionnelle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priorite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phase_id")
    @JsonIgnore
    private InitiationPhase phase;
}
