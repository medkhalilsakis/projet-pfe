import { Role } from "./role.model";

export interface User {
    id?: number;
    nom: string;
    prenom: string;
    username: string;
    email: string;
    password?: string;
    dateEmbauche: string; 
    salaire: number;
    role?: Role;
    ncin: string;
    genre: string;
    online?: boolean;
    lastSeen?: Date;
  }
