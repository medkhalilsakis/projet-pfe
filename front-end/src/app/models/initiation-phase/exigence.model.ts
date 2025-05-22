import { Priority } from "../../enums/priority.enum";

export interface Exigence {
  id?: number;
  fonctionnelle: string;
  nonFonctionnelle: string;
  priorite: Priority;
  // 'phaseId' pour la liaison manuelle si nécessaire
  phaseId?: number;
}
