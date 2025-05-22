export interface AnalyseFaisabilite {
  id?: number;
  techniqueDisponible: boolean;
  budgetSuffisant: boolean;
  delaisRealistes: boolean;
  ressourcesHumainesSuffisantes: boolean;
  phaseId?: number;
}
