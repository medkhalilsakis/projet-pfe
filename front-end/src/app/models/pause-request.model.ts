
import { PauseStatus } from "./enums.model";

export interface PauseRequest {
  /** Identifiant unique de la demande */
  id?: number;

  /** Identifiant du projet concerné */
  projectId: number;

  /** Identifiant de l'utilisateur ayant demandé la pause */
  requesterId: number;

  /** Raison de la demande */
  reason: string;

  /** Statut de la demande */
  status?: PauseStatus;

  /** Date/heure de création de la demande (ISO 8601) */
  requestedAt: string;

  /** Identifiant du superviseur ayant traité la demande (optionnel) */
  supervisorId?: number;

  /** Date/heure de traitement (ISO 8601) */
  handledAt?: string;

  requesterName?: string;
}

/**
 * Pièce jointe associée à une demande de suspension
 */
export interface PauseAttachment {
  /** Identifiant de la pièce jointe */
  id: number;

  /** Identifiant de la demande de pause concernée */
  pauseId: number;

  /** Nom original du fichier */
  filename: string;

  /** Chemin ou URL vers le fichier */
  path: string;
}
