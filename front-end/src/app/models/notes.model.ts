export interface NoteDecision {
  id?: number;
  typeNote: string;
  titre: string;
  contenu: string;
  dateCreation?: string;       // ISO date string
  dateModification?: string;   // ISO date string
  statut?: string;
  superviseurId?: number;      // user id of supervisor
  remarque?: string;
  fichierJoint?: string;
}