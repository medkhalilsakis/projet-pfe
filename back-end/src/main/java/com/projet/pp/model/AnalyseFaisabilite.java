package com.projet.pp.model;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "analyses_faisabilite")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AnalyseFaisabilite {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private boolean techniqueDisponible;
    private boolean budgetSuffisant;
    private boolean delaisRealistes;
    private boolean ressourcesHumainesSuffisantes;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phase_id")
    @JsonIgnore
    private InitiationPhase phase;
}
