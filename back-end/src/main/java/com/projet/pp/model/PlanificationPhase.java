package com.projet.pp.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.*;

@Entity
@Table(name = "planification_phases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlanificationPhase {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomPhase;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Double budgetEstime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phase_id")
    private InitiationPhase phase;
}
