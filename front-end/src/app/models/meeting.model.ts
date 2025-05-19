// src/app/models/meeting.model.ts

import { User } from "./user.model";

/**
 * Représente une réunion liée à un projet.
 */
export interface Meeting {
  /** Identifiant unique de la réunion */
  id?: number;

  /** Sujet de la réunion */
  subject: string;

  /** Date et heure de la réunion (ISO 8601) */
  date: string;

  /** Liste des participants (noms ou ID selon votre API) */
  participantsIds: number[] | null;

  /** Description ou compte‑rendu de la réunion */
  description: string;

  /** Référence au projet concerné */
  projectId?: number;
  // ou si vous préférez charger l'objet complet :
  // project?: Project;
    createdAt: string|number|Date;
  attachments?: File[] | FileList | null;
   // Add these new properties
  participants?: User[];
  participantNames?: string[];
}
