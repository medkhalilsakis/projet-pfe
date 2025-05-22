export interface PlanificationPhase {
  id?: number;
  nomPhase: string;
  dateDebut: string;    // ISO date string, e.g. '2025-05-22'
  dateFin: string;
  budgetEstime: number;
  phaseId?: number;
}
