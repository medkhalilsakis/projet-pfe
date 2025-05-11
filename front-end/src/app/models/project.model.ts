// src/app/models/project.model.ts
import { User } from './user.model';
import { ProjectTesterAssignment } from './assignment.model';
import { ProjectFile } from './project-file.model';

export interface Project {
  id: number;
  user: User;                        // utilisateur propriétaire
  name: string;                      // nom du projet
  type?: string;                     // type (nullable)
  description?: string;              // description longue (nullable)
  visibilite: string;                // "public" or "privée"
  committed: boolean;                // commit final effectué ?
  createdAt: string;                 // ISO datetime (CreationTimestamp)
  updatedAt: string;                 // ISO datetime (UpdateTimestamp)
  status: number;                   // statut numérique (nullable)
  assignments?: ProjectTesterAssignment[]; // 1-n assignations testeurs
  files?: ProjectFile[];             // 1-n fichiers du projet
  invitedUsers?: User[];             // liste des users invités
}
