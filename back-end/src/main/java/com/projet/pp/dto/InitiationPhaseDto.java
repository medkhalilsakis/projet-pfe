package com.projet.pp.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InitiationPhaseDto {
    private Long id;
    private String introduction;
    private String objectifs;

    private List<ExigenceDto> exigences;
    private AnalyseFaisabiliteDto faisabilite;
    private CahierDesChargesDto cahierDesCharges;
    private List<PlanificationPhaseDto> plannings;

    // ---- classes imbriquées statiques, publiques et accessibles ----

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExigenceDto {
        private Long id;
        private String fonctionnelle;
        private String nonFonctionnelle;
        private String priorite;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnalyseFaisabiliteDto {
        private Long id;
        private boolean techniqueDisponible;
        private boolean budgetSuffisant;
        private boolean delaisRealistes;
        private boolean ressourcesHumainesSuffisantes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CahierDesChargesDto {
        private Long id;
        private String objectifsProjet;
        private String livrables;
        private String contraintes;
        private String criteresSucces;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlanificationPhaseDto {
        private Long id;
        private String nomPhase;
        private String dateDebut;
        private String dateFin;
        private double budgetEstime;
    }
}
