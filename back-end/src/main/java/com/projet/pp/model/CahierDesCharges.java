package com.projet.pp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cahier_des_charges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CahierDesCharges {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String objectifsProjet;

    @Column(columnDefinition = "TEXT")
    private String livrables;

    @Column(columnDefinition = "TEXT")
    private String contraintes;

    @Column(columnDefinition = "TEXT")
    private String criteresSucces;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phase_id")
    private InitiationPhase phase;
}
