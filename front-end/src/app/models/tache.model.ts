import { TacheStatus } from "./enums.model";



export interface SimpleUser {
  id: number;
  prenom: string;
  nom: string;
}


export interface Attachment {
  id: number;
  fileName: string;
  fileType: string;
  filePath?: string;
  fileSize?: number;
}


export interface Tache {
  id: number;
  name: string;
  description?: string;
  outils?: string;

  status: TacheStatus;
  deadline?: string;       // ISO date string (YYYY-MM-DD)
  creationDate?: string;   // ISO date string

  assignedBy: SimpleUser;
  assignedTo: SimpleUser[];      // toujours présent, même en mode liste
  projectId?: number;            // lien one-to-one optionnel vers Project

  attachments?: Attachment[];
}
