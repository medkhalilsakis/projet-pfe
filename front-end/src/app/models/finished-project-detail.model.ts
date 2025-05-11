// src/app/models/finished-project-detail.model.ts

/**
 * Détail d’un projet terminé ou mis en pause,
 * calqué sur FinishedProjectDTO côté backend.
 */
export interface FinishedProjectDetail {
  /** ID du projet */
  projectId: number;

  /** Nom du projet */
  name: string;

  /**
   * Statut numérique du projet :
   * -1 = archivé, 0 = brouillon, …, 55 = pause, 99 = clôturé
   */
  status: number;

  /** Date/heure de mise en pause (ISO datetime) */
  pausedAt?: string;

  /** Date/heure de clôture   (ISO datetime) */
  closureAt?: string;

  /** Nom du superviseur ayant géré la pause/clôture */
  supervisorName: string;

  /** Noms des testeurs assignés */
  testerNames: string[];
}
