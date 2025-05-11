export type BugLevel = 'critical' | 'major' | 'minor';

/**
 * Représentation d'une demande de bug côté client.
 */
export interface BugReport {
  id: number;

  level: BugLevel;

  /** Description du problème rencontré */
  description: string;

  /** Suggestions pour corriger ou améliorer */
  suggestions: string;

  /** Liste d'URLs ou chemins vers les pièces jointes (images, logs…) */
  attachments: string[];

  /** ID du projet associé, si besoin on peut charger le Project complet via un service */
  projectId?: number;

  /** Date/heure de création (ISO string) */
  createdAt?: string;
}
